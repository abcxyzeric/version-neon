
import React, { useState, useRef, WheelEvent, useEffect, useCallback } from 'react';
import { KnowledgeBase, GameLocation, GameScreen, Region, LocationConnection, FindLocationParams } from '../../../types';
import InteractiveMap from './InteractiveMap';
import Button from '../../../components/ui/Button';
import { VIETNAMESE } from '../../../constants';
import { MAP_COLORS, MAP_SIZES } from './mapConstants';
import Modal from '../../../components/ui/Modal';
import * as GameTemplates from '../../../templates';
import * as LocationIcons from './mapIcons';
import FindLocationModal from './FindLocationModal'; 
import { useGame } from '../../../hooks/useGame';

interface MapPanelProps {
  knowledgeBase: KnowledgeBase;
  setCurrentScreen: (screen: GameScreen) => void;
}

const LegendItem: React.FC<{ color?: string; icon?: React.ReactNode; label: string }> = ({ color, icon, label }) => (
  <div className="flex items-center space-x-2">
    {icon ? (
        <span style={{ width: MAP_SIZES.LEGEND_ITEM_SIZE, height: MAP_SIZES.LEGEND_ITEM_SIZE }} className="inline-block flex-shrink-0">
            {icon}
        </span>
    ) : (
      <span
        style={{ backgroundColor: color, width: MAP_SIZES.LEGEND_ITEM_SIZE, height: MAP_SIZES.LEGEND_ITEM_SIZE }}
        className="inline-block rounded-full border border-gray-600 flex-shrink-0"
      ></span>
    )}
    <span className="text-xs text-gray-300">{label}</span>
  </div>
);

const MapPanel: React.FC<MapPanelProps> = ({
  knowledgeBase,
  setCurrentScreen,
}) => {
  const game = useGame();
  const [selectedLocationDetails, setSelectedLocationDetails] = useState<GameLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationHistory, setLocationHistory] = useState<GameLocation[]>([]);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [viewMatrix, setViewMatrix] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const [interaction, setInteraction] = useState<{
    type: 'pan' | 'drag';
    targetId?: string;
    startX: number;
    startY: number;
    initialNodeX?: number;
    initialNodeY?: number;
    initialTranslateX?: number;
    initialTranslateY?: number;
  } | null>(null);

  // Unified coordinate getter for both mouse and touch events
  const getCoords = (e: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>): { x: number, y: number } => {
    if ('touches' in e && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const handleInteractionStart = useCallback((
    e: React.MouseEvent<SVGSVGElement | SVGGElement> | React.TouchEvent<SVGSVGElement | SVGGElement>, 
    type: 'pan' | 'drag', 
    locationId?: string
  ) => {
    if (type === 'drag' && (!isEditMode || !locationId)) return;
    
    if (type === 'drag') {
        e.stopPropagation();
    }

    const { x, y } = getCoords(e as any);

    if (type === 'drag' && locationId) {
        const targetLocation = knowledgeBase.discoveredLocations.find(l => l.id === locationId);
        if (!targetLocation) return;
        setInteraction({
            type: 'drag',
            targetId: locationId,
            startX: x,
            startY: y,
            initialNodeX: targetLocation.mapX || 0,
            initialNodeY: targetLocation.mapY || 0
        });
    } else { // type is 'pan'
        setInteraction({
            type: 'pan',
            startX: x,
            startY: y,
            initialTranslateX: viewMatrix.translateX,
            initialTranslateY: viewMatrix.translateY
        });
    }

    if (svgRef.current) svgRef.current.style.cursor = 'grabbing';
  }, [isEditMode, knowledgeBase.discoveredLocations, viewMatrix.translateX, viewMatrix.translateY]);

  const handleInteractionMove = useCallback((e: globalThis.MouseEvent | globalThis.TouchEvent) => {
    if (!interaction) return;
    
    const getMoveCoords = (ev: globalThis.MouseEvent | globalThis.TouchEvent): { x: number; y: number } | null => {
        if (ev instanceof MouseEvent) return { x: ev.clientX, y: ev.clientY };
        if (ev instanceof TouchEvent && ev.touches && ev.touches.length > 0) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
        return null;
    };
    
    const coords = getMoveCoords(e);
    if (!coords) return;

    if (e.cancelable) e.preventDefault();

    requestAnimationFrame(() => {
        if (!interaction) return;

        const dx = coords.x - interaction.startX;
        const dy = coords.y - interaction.startY;
        
        if (interaction.type === 'pan' && interaction.initialTranslateX !== undefined && interaction.initialTranslateY !== undefined) {
            setViewMatrix(prev => ({
                ...prev,
                translateX: interaction.initialTranslateX! + dx,
                translateY: interaction.initialTranslateY! + dy,
            }));
        } else if (interaction.type === 'drag' && interaction.targetId && interaction.initialNodeX !== undefined && interaction.initialNodeY !== undefined) {
            const svgDx = dx / viewMatrix.scale;
            const svgDy = dy / viewMatrix.scale;
            
            const newX = interaction.initialNodeX + svgDx;
            const newY = interaction.initialNodeY + svgDy;
    
            game.updateLocationCoordinates(interaction.targetId, newX, newY);
        }
    });
  }, [interaction, viewMatrix.scale, game]);

  const handleInteractionEnd = useCallback(() => {
    setInteraction(null);
    if (svgRef.current) svgRef.current.style.cursor = isEditMode ? 'default' : 'grab';
  }, [isEditMode]);

  useEffect(() => {
    if (interaction) {
      window.addEventListener('mousemove', handleInteractionMove);
      window.addEventListener('touchmove', handleInteractionMove, { passive: false });
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd);
      window.addEventListener('touchcancel', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('touchmove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('touchcancel', handleInteractionEnd);
    }
  }, [interaction, handleInteractionMove, handleInteractionEnd]);


  const onWheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const scaleAmount = 0.1;
    const newScale = e.deltaY > 0 ? viewMatrix.scale * (1 - scaleAmount) : viewMatrix.scale * (1 + scaleAmount);
    const clampedScale = Math.max(0.2, Math.min(newScale, 5));
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    
    const pointInSvg = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const newTranslateX = pointInSvg.x - (pointInSvg.x - viewMatrix.translateX) * (clampedScale / viewMatrix.scale);
    const newTranslateY = pointInSvg.y - (pointInSvg.y - viewMatrix.translateY) * (clampedScale / viewMatrix.scale);

    setViewMatrix({
        scale: clampedScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
    });
  };

  const zoom = (factor: number) => {
    const newScale = Math.max(0.2, Math.min(viewMatrix.scale * factor, 5));
    const centerX = MAP_SIZES.SVG_VIEWBOX_WIDTH / 2;
    const centerY = MAP_SIZES.SVG_VIEWBOX_HEIGHT / 2;
    const newTranslateX = centerX - (centerX - viewMatrix.translateX) * (newScale / viewMatrix.scale);
    const newTranslateY = centerY - (centerY - viewMatrix.translateY) * (newScale / viewMatrix.scale);
    setViewMatrix({ scale: newScale, translateX: newTranslateX, translateY: newTranslateY });
  };

  const resetView = () => setViewMatrix({ scale: 1, translateX: 0, translateY: 0 });

  const handleLocationClick = (locationId: string) => {
    const location = knowledgeBase.discoveredLocations.find(loc => loc.id === locationId);
    if (location) {
      setLocationHistory([location]);
      setSelectedLocationDetails(location);
      setIsLocationModalOpen(true);
    }
  };
  
  const handleSubLocationClick = (subLocation: GameLocation) => {
    setLocationHistory(prev => [...prev, subLocation]);
    setSelectedLocationDetails(subLocation);
  };

  const handleModalBack = () => {
    const newHistory = [...locationHistory];
    newHistory.pop();
    if (newHistory.length > 0) {
      setLocationHistory(newHistory);
      setSelectedLocationDetails(newHistory[newHistory.length - 1]);
    }
  };

  const handleCloseModal = () => {
    setIsLocationModalOpen(false);
    setSelectedLocationDetails(null);
    setLocationHistory([]);
  };

  const handleStartSearch = (params: FindLocationParams) => {
    game.handleFindLocation(params);
    setIsFindModalOpen(false);
  };
  
  const currentLocation = knowledgeBase.discoveredLocations.find(loc => loc.id === knowledgeBase.currentLocationId);
  const getRegionName = (regionId?: string): string | undefined => {
    if (!regionId) return undefined;
    return knowledgeBase.discoveredRegions.find(r => r.id === regionId)?.name;
  };

  const transformString = `translate(${viewMatrix.translateX} ${viewMatrix.translateY}) scale(${viewMatrix.scale})`;
  const viewBox = `0 0 ${MAP_SIZES.SVG_VIEWBOX_WIDTH} ${MAP_SIZES.SVG_VIEWBOX_HEIGHT}`;

  const iconLegendData = [
    { icon: <LocationIcons.PlayerIcon className="text-white"/>, label: VIETNAMESE.legendCurrentLocation },
    { icon: <LocationIcons.VillageIcon className="text-white"/>, label: VIETNAMESE.locationType_VILLAGE },
    { icon: <LocationIcons.TownIcon className="text-white"/>, label: VIETNAMESE.locationType_TOWN },
    { icon: <LocationIcons.CityIcon className="text-white"/>, label: VIETNAMESE.locationType_CITY },
    { icon: <LocationIcons.CapitalIcon className="text-white"/>, label: VIETNAMESE.locationType_CAPITAL },
    { icon: <LocationIcons.SectIcon className="text-white"/>, label: VIETNAMESE.locationType_SECT_CLAN },
    { icon: <LocationIcons.ShopIcon className="text-white"/>, label: VIETNAMESE.locationType_SHOP },
    { icon: <LocationIcons.InnIcon className="text-white"/>, label: VIETNAMESE.locationType_INN },
    { icon: <LocationIcons.ForestIcon className="text-white"/>, label: VIETNAMESE.locationType_FOREST },
    { icon: <LocationIcons.MountainIcon className="text-white"/>, label: VIETNAMESE.locationType_MOUNTAIN },
    { icon: <LocationIcons.CaveIcon className="text-white"/>, label: VIETNAMESE.locationType_CAVE },
    { icon: <LocationIcons.DungeonIcon className="text-white"/>, label: VIETNAMESE.locationType_DUNGEON },
    { icon: <LocationIcons.RuinIcon className="text-white"/>, label: VIETNAMESE.locationType_RUIN },
    { icon: <LocationIcons.WaterIcon className="text-white"/>, label: VIETNAMESE.locationType_RIVER_LAKE },
    { icon: <LocationIcons.LandmarkIcon className="text-white"/>, label: VIETNAMESE.locationType_LANDMARK },
    { icon: <LocationIcons.DefaultIcon className="text-white"/>, label: VIETNAMESE.locationType_DEFAULT },
  ];

  const colorLegendData = [
      { color: MAP_COLORS.CURRENT_LOCATION_NODE, label: VIETNAMESE.legendCurrentLocation },
      { color: MAP_COLORS.SAFE_ZONE_NODE, label: VIETNAMESE.legendSafeZoneNode },
      { color: MAP_COLORS.DISCOVERED_LOCATION_NODE, label: VIETNAMESE.legendDiscoveredLocationNode },
      { color: MAP_COLORS.UNDISCOVERED_HINT_NODE, label: VIETNAMESE.legendUnvisitedLocation },
      { color: MAP_COLORS.PATH_DISCOVERED, label: VIETNAMESE.legendPathDiscovered },
  ];

  const subLocationsForSelected = selectedLocationDetails 
    ? knowledgeBase.discoveredLocations.filter(loc => loc.parentLocationId === selectedLocationDetails?.id)
    : [];

  return (
    <>
    <div className="h-screen flex flex-col bg-gray-800 p-2 sm:p-3 text-gray-100">
      <header className="mb-2 sm:mb-3 flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-500 to-cyan-600">
          Bản Đồ Thế Giới
        </h1>
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsEditMode(prev => !prev)} size="sm" variant={isEditMode ? "primary" : "secondary"} title={isEditMode ? "Tắt chế độ sửa" : "Bật chế độ sửa tọa độ"} className={`${isEditMode ? 'bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-400' : 'border-orange-500 text-orange-300 hover:bg-orange-700/60'}`}>
                {isEditMode ? 'Lưu Tọa Độ' : 'Sửa Tọa Độ'}
            </Button>
            <Button variant="secondary" onClick={() => setCurrentScreen(GameScreen.Gameplay)}>
                {VIETNAMESE.goBackButton}
            </Button>
        </div>
      </header>
      
      <div className="flex-grow bg-gray-900 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
        {currentLocation && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-900/70 px-3 py-1 rounded-full z-20 pointer-events-none text-xs sm:text-sm text-center">
              Vị trí hiện tại: <strong className="text-amber-400">{currentLocation.name}</strong>
            </div>
          )}
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={viewBox}
            className="rounded-md"
            onMouseDown={(e) => handleInteractionStart(e, 'pan')}
            onTouchStart={(e) => handleInteractionStart(e, 'pan')}
            onWheel={onWheel}
            style={{ cursor: isEditMode ? 'default' : 'grab' }}
            aria-label="Bản đồ thế giới tương tác"
        >
            <rect width={MAP_SIZES.SVG_VIEWBOX_WIDTH} height={MAP_SIZES.SVG_VIEWBOX_HEIGHT} fill={MAP_COLORS.MAP_BACKGROUND} />
            <InteractiveMap
              locations={knowledgeBase.discoveredLocations}
              currentLocationId={currentLocation?.id || null}
              onLocationClick={handleLocationClick}
              transform={transformString}
              isEditMode={isEditMode}
              onNodeMouseDown={(e, id) => handleInteractionStart(e, 'drag', id)}
              onNodeTouchStart={(e, id) => handleInteractionStart(e, 'drag', id)}
            />
        </svg>

        {/* Floating Controls */}
        <div className="absolute top-2 right-2 z-20 flex gap-2 flex-wrap justify-end">
            <Button onClick={() => setIsFindModalOpen(true)} size="sm" variant="secondary" title={VIETNAMESE.findLocationButtonTitle} className="border-cyan-500 text-cyan-300 hover:bg-cyan-700/60" disabled={game.isLoadingApi || isEditMode}>
                {VIETNAMESE.findLocationButtonLabel}
            </Button>
            <Button onClick={() => setIsLegendOpen(!isLegendOpen)} size="sm" variant="secondary" title={VIETNAMESE.mapLegendTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v14.25c0 .621.504 1.125 1.125 1.125z" /></svg>
            </Button>
        </div>
        
        {isLegendOpen && (
            <div className="absolute top-12 right-2 z-20 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 max-h-[70vh] w-56 overflow-y-auto custom-scrollbar">
                <h3 className="text-md font-semibold text-teal-300 mb-3 border-b border-gray-600 pb-2">{VIETNAMESE.mapLegendTitle}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">{VIETNAMESE.mapIconLegendTitle || "Chú giải Icon"}</h4>
                    <div className="space-y-2">
                        {iconLegendData.map(item => <LegendItem key={item.label} icon={item.icon} label={item.label} />)}
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">{VIETNAMESE.mapColorLegendTitle || "Chú giải Màu sắc"}</h4>
                    <div className="space-y-2">
                        {colorLegendData.map(item => <LegendItem key={item.label} color={item.color} label={item.label} />)}
                    </div>
                  </div>
                </div>
            </div>
        )}

        <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-gray-900/50 p-1.5 rounded-lg z-20">
            <Button onClick={() => zoom(1.2)} size="sm" variant="secondary" title={VIETNAMESE.zoomIn} className="!w-8 !h-8 !p-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </Button>
            <Button onClick={() => zoom(1/1.2)} size="sm" variant="secondary" title={VIETNAMESE.zoomOut} className="!w-8 !h-8 !p-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
            </Button>
            <Button onClick={resetView} size="sm" variant="secondary" title={VIETNAMESE.resetView} className="!w-8 !h-8 !p-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            </Button>
        </div>
      </div>
      
       {selectedLocationDetails && (
        <Modal
          isOpen={isLocationModalOpen}
          onClose={handleCloseModal}
          title={`Chi Tiết: ${selectedLocationDetails.name}`}
        >
          <div className="space-y-2 text-sm">
            <p><strong className="text-indigo-300">Tên:</strong> {selectedLocationDetails.name}</p>
            {selectedLocationDetails.locationType && <p><strong className="text-indigo-300">Loại:</strong> {selectedLocationDetails.locationType}</p>}
            {(selectedLocationDetails.mapX !== undefined && selectedLocationDetails.mapY !== undefined) && (
              <p><strong className="text-indigo-300">Tọa độ:</strong> ({selectedLocationDetails.mapX}-{selectedLocationDetails.mapY})</p>
            )}
            {selectedLocationDetails.description && <p><strong className="text-indigo-300">Mô tả:</strong> {selectedLocationDetails.description}</p>}
            {selectedLocationDetails.regionId && (
                <p><strong className="text-indigo-300">{VIETNAMESE.regionLabel || "Vùng"}:</strong> {getRegionName(selectedLocationDetails.regionId) || selectedLocationDetails.regionId}</p>
            )}
            <p><strong className="text-indigo-300">An toàn:</strong> {selectedLocationDetails.isSafeZone ? "Có" : "Không"}</p>
            {selectedLocationDetails.parentLocationId === undefined && (
              <p><strong className="text-indigo-300">{VIETNAMESE.locationStatusLabel}:</strong> <span className={selectedLocationDetails.visited ? 'text-green-400 font-semibold' : 'text-gray-400'}>{selectedLocationDetails.visited ? VIETNAMESE.locationStatusVisited : VIETNAMESE.locationStatusUnvisited}</span></p>
            )}
            
            {selectedLocationDetails.connections && selectedLocationDetails.connections.some(c => c.isDiscovered) && (
              <div className="mt-2">
                <strong className="text-indigo-300">Kết nối đã biết:</strong>
                <ul className="list-disc list-inside pl-4 text-gray-300 text-xs">
                  {selectedLocationDetails.connections.filter(c => c.isDiscovered).map(conn => {
                    const target = knowledgeBase.discoveredLocations.find(l => l.id === conn.targetLocationId);
                    let connDetails = target?.name || conn.targetLocationId;
                    if (conn.travelTimeTurns) connDetails += ` (Thời gian: ${conn.travelTimeTurns} lượt)`;
                    if (conn.description) connDetails += ` - ${conn.description}`;
                    return <li key={conn.targetLocationId}>{connDetails}</li>;
                  })}
                </ul>
              </div>
            )}
            {subLocationsForSelected.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-600">
                    <strong className="text-indigo-300">Khu Vực Phụ:</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                        {subLocationsForSelected.map(subLoc => (
                            <li key={subLoc.id}>
                                <button onClick={() => handleSubLocationClick(subLoc)} className="text-cyan-400 hover:text-cyan-300 underline">
                                    {subLoc.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
           {locationHistory.length > 1 && (
                 <div className="mt-4 pt-4 border-t border-gray-700 flex justify-start">
                     <Button onClick={handleModalBack} variant="secondary">
                        &larr; Quay lại {locationHistory[locationHistory.length - 2].name}
                    </Button>
                </div>
            )}
        </Modal>
      )}
    </div>
    {isFindModalOpen && (
        <FindLocationModal
            isOpen={isFindModalOpen}
            onClose={() => setIsFindModalOpen(false)}
            onSearch={handleStartSearch}
            isLoading={game.isLoadingApi}
        />
    )}
    </>
  );
};

export default MapPanel;
