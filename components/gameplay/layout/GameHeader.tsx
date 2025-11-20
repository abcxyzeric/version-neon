import React from 'react';
import { GameScreen } from '../../../types';
import Button from '../../ui/Button';
import { VIETNAMESE } from '../../../constants';

interface GameHeaderProps {
  gameTitleDisplay: string;
  isCharPanelOpen: boolean;
  isQuestsPanelOpen: boolean;
  isWorldPanelOpen: boolean;
  setIsCharPanelOpen: (isOpen: boolean) => void;
  setIsQuestsPanelOpen: (isOpen: boolean) => void;
  setIsWorldPanelOpen: (isOpen: boolean) => void;
  setCurrentScreen: (screen: GameScreen) => void;
  onRollbackTurn: () => void;
  isStopButtonDisabled: boolean;
  isLoading: boolean; // For stop button
  onSaveGame: () => Promise<void>;
  isSaveDisabled: boolean;
  isSavingGame: boolean;
  showDebugPanel: boolean;
  setShowDebugPanel: (show: boolean) => void;
  onQuit: () => void;
  isSummarizing: boolean; // For disabling buttons
  setIsStyleSettingsModalOpen: (isOpen: boolean) => void;
  isLocationSafe: boolean; 
  isRestricted: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameTitleDisplay,
  isCharPanelOpen,
  isQuestsPanelOpen,
  isWorldPanelOpen,
  setIsCharPanelOpen,
  setIsQuestsPanelOpen,
  setIsWorldPanelOpen,
  setCurrentScreen,
  onRollbackTurn,
  isStopButtonDisabled,
  isLoading,
  onSaveGame,
  isSaveDisabled,
  isSavingGame,
  showDebugPanel,
  setShowDebugPanel,
  onQuit,
  isSummarizing,
  setIsStyleSettingsModalOpen,
  isLocationSafe,
  isRestricted,
}) => {
  return (
    <header className="mb-2 sm:mb-4 flex flex-col sm:flex-row justify-between items-center flex-shrink-0 gap-2">
      <h1
        className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600 truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
        title={gameTitleDisplay}
      >
        {gameTitleDisplay}
      </h1>
      <div className="flex space-x-1 sm:space-x-2 flex-wrap gap-y-1 sm:gap-y-2 justify-center sm:justify-end">
        <Button onClick={() => setIsCharPanelOpen(true)} variant={isCharPanelOpen ? "primary" : "secondary"} size="sm" aria-pressed={isCharPanelOpen} disabled={isSummarizing} className="px-2 sm:px-3" title={VIETNAMESE.characterButton}>
          <span className="sm:hidden">🧑</span>
          <span className="hidden sm:inline">{VIETNAMESE.characterButton}</span>
        </Button>
        <Button onClick={() => setCurrentScreen(GameScreen.Equipment)} variant="secondary" size="sm" disabled={isSummarizing} className="px-2 sm:px-3 border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white" title={VIETNAMESE.equipmentButton}>
          <span className="sm:hidden">⚔️</span>
          <span className="hidden sm:inline">{VIETNAMESE.equipmentButton}</span>
        </Button>
        <Button onClick={() => setCurrentScreen(GameScreen.CompanionManagement)} variant="secondary" size="sm" disabled={isSummarizing || isRestricted} className="px-2 sm:px-3 border-pink-500 text-pink-300 hover:bg-pink-700 hover:text-white" title={VIETNAMESE.companionManagementButton}>
            <span className="sm:hidden" role="img" aria-label="Companions">❤️</span>
            <span className="hidden sm:inline">{VIETNAMESE.companionManagementButton}</span>
        </Button>
        <Button onClick={() => setCurrentScreen(GameScreen.CompanionEquipment)} variant="secondary" size="sm" disabled={isSummarizing || isRestricted} className="px-2 sm:px-3 border-pink-500 text-pink-300 hover:bg-pink-700 hover:text-white" title={"Trang Bị Hậu Cung"}>
            <span className="sm:hidden" role="img" aria-label="Companion Equipment">❤️‍🩹</span>
            <span className="hidden sm:inline">Trang Bị Hậu Cung</span>
        </Button>
         <Button onClick={() => setCurrentScreen(GameScreen.PrisonerManagement)} variant="secondary" size="sm" disabled={isSummarizing || isRestricted} className="px-2 sm:px-3 border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white" title={VIETNAMESE.prisonerManagementButton}>
            <span className="sm:hidden" role="img" aria-label="Prisoners">🔗</span>
            <span className="hidden sm:inline">{VIETNAMESE.prisonerManagementButton}</span>
        </Button>
         <Button onClick={() => setCurrentScreen(GameScreen.Map)} variant="secondary" size="sm" disabled={isSummarizing} className="px-2 sm:px-3 border-green-500 text-green-300 hover:bg-green-700 hover:text-white">
          <span className="sm:hidden">🗺️</span>
          <span className="hidden sm:inline">{VIETNAMESE.mapButton}</span>
        </Button>
        <Button onClick={() => setCurrentScreen(GameScreen.Crafting)} variant="secondary" size="sm" disabled={isSummarizing || isRestricted} className="px-2 sm:px-3 border-orange-500 text-orange-300 hover:bg-orange-700 hover:text-white" title={VIETNAMESE.craftingButton}>
          <span className="sm:hidden">⚗️</span>
          <span className="hidden sm:inline">{VIETNAMESE.craftingButton}</span>
        </Button>
        {isLocationSafe && (
          <Button
            onClick={() => setCurrentScreen(GameScreen.Cultivation)}
            variant="secondary"
            size="sm"
            disabled={isSummarizing || isLoading || isRestricted}
            className="px-2 sm:px-3 border-emerald-500 text-emerald-300 hover:bg-emerald-700 hover:text-white"
            title={VIETNAMESE.cultivationButton}
          >
            <span className="sm:hidden" role="img" aria-label="cultivate">🧘</span>
            <span className="hidden sm:inline">{VIETNAMESE.cultivationButton}</span>
          </Button>
        )}
        <Button onClick={() => setIsWorldPanelOpen(true)} variant={isWorldPanelOpen ? "primary" : "secondary"} size="sm" aria-pressed={isWorldPanelOpen} disabled={isSummarizing} className="px-2 sm:px-3">
          <span className="sm:hidden">🌍</span>
          <span className="hidden sm:inline">{VIETNAMESE.worldButton}</span>
        </Button>
        <Button onClick={() => setIsQuestsPanelOpen(true)} variant={isQuestsPanelOpen ? "primary" : "secondary"} size="sm" aria-pressed={isQuestsPanelOpen} disabled={isSummarizing} className="px-2 sm:px-3" title={VIETNAMESE.questsButton}>
          <span className="sm:hidden">📜</span>
          <span className="hidden sm:inline">{VIETNAMESE.questsButton}</span>
        </Button>
        <Button
          onClick={() => setCurrentScreen(GameScreen.Prompts)}
          variant="secondary"
          size="sm"
          disabled={isSummarizing}
          className="px-2 sm:px-3 border-teal-500 text-teal-300 hover:bg-teal-700 hover:text-white"
          title="Lời nhắc cho AI"
        >
          <span className="sm:hidden">📝</span>
          <span className="hidden sm:inline">Lời Nhắc</span>
        </Button>
        <Button
          onClick={() => setIsStyleSettingsModalOpen(true)}
          variant="secondary"
          size="sm"
          disabled={isSummarizing}
          className="border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white px-2 sm:px-3"
          title={VIETNAMESE.gameplaySettingsButton}
        >
          <span className="sm:hidden">⚙️</span><span className="hidden sm:inline">{VIETNAMESE.gameplaySettingsButtonShort || VIETNAMESE.gameplaySettingsButton}</span>
        </Button>
        <Button
          onClick={onRollbackTurn}
          variant="secondary"
          size="sm"
          disabled={isStopButtonDisabled}
          title={isLoading ? "Dừng nhận phản hồi và lùi lượt" : VIETNAMESE.rollbackTurn}
          className="border-amber-500 text-amber-300 hover:bg-amber-700 hover:text-white px-2 sm:px-3"
        >
          <span className="sm:hidden">⏪</span><span className="hidden sm:inline">{VIETNAMESE.stopButtonShort || VIETNAMESE.stopButton}</span>
        </Button>
        <Button
          onClick={onSaveGame}
          variant="primary"
          size="sm"
          disabled={isSaveDisabled}
          isLoading={isSavingGame}
          loadingText="Đang lưu..."
          title={VIETNAMESE.saveGameButton}
          className="px-2 sm:px-3"
        >
          <span className="sm:hidden">💾</span><span className="hidden sm:inline">{VIETNAMESE.saveGameButtonShort || VIETNAMESE.saveGameButton}</span>
        </Button>
        <Button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          variant={showDebugPanel ? "primary" : "ghost"}
          size="sm"
          className="border-yellow-500 text-yellow-300 hover:bg-yellow-700 hover:text-white px-2 sm:px-3"
          title="Debug Panel"
        >
          <span className="sm:hidden" aria-hidden="true">🐞</span>
          <span className="hidden sm:inline">Debug</span>
        </Button>
        <Button onClick={onQuit} variant="danger" size="sm" disabled={isSummarizing} className="px-2 sm:px-3" title={VIETNAMESE.quitGameButtonTitle}>
          <span className="sm:hidden">🚪</span><span className="hidden sm:inline">{VIETNAMESE.quitGameButtonShort || VIETNAMESE.quitGameButton}</span>
        </Button>
      </div>
    </header>
  );
};

export default GameHeader;