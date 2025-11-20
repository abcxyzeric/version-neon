import React, { ChangeEvent } from 'react';
import { GameMessage, PlayerActionInputType, ResponseLength } from '../../../types';
import Button from '../../ui/Button';
import { VIETNAMESE } from '../../../constants';

interface PlayerInputAreaProps {
  latestMessageWithChoices: GameMessage | undefined;
  showAiSuggestions: boolean;
  setShowAiSuggestions: (show: boolean) => void;
  playerInput: string;
  setPlayerInput: (input: string) => void;
  currentActionType: PlayerActionInputType;
  setCurrentActionType: (type: PlayerActionInputType) => void;
  isActionTypeDropdownOpen: boolean;
  setIsActionTypeDropdownOpen: (isOpen: boolean) => void;
  actionTypeDropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedResponseLength: ResponseLength;
  setSelectedResponseLength: (length: ResponseLength) => void;
  isResponseLengthDropdownOpen: boolean;
  setIsResponseLengthDropdownOpen: (isOpen: boolean) => void;
  responseLengthDropdownRef: React.RefObject<HTMLDivElement | null>;
  isLoadingUi: boolean;
  isSummarizingUi: boolean;
  isCurrentlyActivePage: boolean;
  messageIdBeingEdited: string | null;
  handleChoiceClick: (choiceText: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  choiceButtonStyles: React.CSSProperties; // New Prop
}

const PlayerInputArea: React.FC<PlayerInputAreaProps> = ({
  latestMessageWithChoices,
  showAiSuggestions,
  setShowAiSuggestions,
  playerInput,
  setPlayerInput,
  currentActionType,
  setCurrentActionType,
  isActionTypeDropdownOpen,
  setIsActionTypeDropdownOpen,
  actionTypeDropdownRef,
  selectedResponseLength,
  setSelectedResponseLength,
  isResponseLengthDropdownOpen,
  setIsResponseLengthDropdownOpen,
  responseLengthDropdownRef,
  isLoadingUi,
  isSummarizingUi,
  isCurrentlyActivePage,
  messageIdBeingEdited,
  handleChoiceClick,
  handleSubmit,
  choiceButtonStyles, // New Prop
}) => {

    const responseLengthOptions: { label: string, value: ResponseLength }[] = [
        { label: VIETNAMESE.responseLength_default, value: 'default' },
        { label: VIETNAMESE.responseLength_short, value: 'short' },
        { label: VIETNAMESE.responseLength_medium, value: 'medium' },
        { label: VIETNAMESE.responseLength_long, value: 'long' },
    ];

  return (
    <div className="bg-gray-800 p-2 sm:p-3 border-t border-gray-700 flex-shrink-0">
      {latestMessageWithChoices?.choices && latestMessageWithChoices.choices.length > 0 && isCurrentlyActivePage && !isSummarizingUi && (
        <div className="mb-2">
          <Button type="button" variant="ghost" size="sm" className="w-full text-left justify-start py-1.5 px-2 text-xs text-indigo-300 hover:text-indigo-200 mb-1" onClick={() => setShowAiSuggestions(!showAiSuggestions)}>
            {showAiSuggestions ? VIETNAMESE.hideAiSuggestionsButton : VIETNAMESE.showAiSuggestionsButton}
          </Button>
          {showAiSuggestions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              {latestMessageWithChoices.choices.map((choice, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className="w-full text-left justify-start py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm whitespace-normal h-auto" 
                  onClick={() => handleChoiceClick(choice.text)} 
                  disabled={isLoadingUi || isSummarizingUi || !isCurrentlyActivePage || !!messageIdBeingEdited} 
                  title={choice.text}
                  customStyles={choiceButtonStyles} // Apply styles
                >
                  {index + 1}. {choice.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            {/* Action Type Dropdown */}
            <div ref={actionTypeDropdownRef} className="relative flex-shrink-0">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto h-full justify-between"
                    onClick={() => setIsActionTypeDropdownOpen(!isActionTypeDropdownOpen)}
                    disabled={isLoadingUi || isSummarizingUi || !isCurrentlyActivePage || !!messageIdBeingEdited}
                >
                    <span>Loại: {currentActionType === 'action' ? VIETNAMESE.inputTypeActionLabel : VIETNAMESE.inputTypeStoryLabel}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Button>
                {isActionTypeDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-gray-600 rounded-md shadow-lg z-20">
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentActionType('action'); setIsActionTypeDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500 rounded-t-md">{VIETNAMESE.inputTypeActionLabel}</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentActionType('story'); setIsActionTypeDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500 rounded-b-md">{VIETNAMESE.inputTypeStoryLabel}</a>
                    </div>
                )}
            </div>
            {/* Response Length Dropdown */}
            <div ref={responseLengthDropdownRef} className="relative flex-shrink-0">
                 <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto h-full justify-between"
                    onClick={() => setIsResponseLengthDropdownOpen(!isResponseLengthDropdownOpen)}
                    disabled={isLoadingUi || isSummarizingUi || !isCurrentlyActivePage || !!messageIdBeingEdited}
                >
                    <span>{VIETNAMESE.responseLengthLabel}: {responseLengthOptions.find(o => o.value === selectedResponseLength)?.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Button>
                {isResponseLengthDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-1 w-max bg-gray-600 rounded-md shadow-lg z-20">
                        {responseLengthOptions.map(opt => (
                            <a
                                key={opt.value}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setSelectedResponseLength(opt.value); setIsResponseLengthDropdownOpen(false); }}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500 first:rounded-t-md last:rounded-b-md"
                            >
                                {opt.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder={!isCurrentlyActivePage ? "Chỉ có thể hành động ở trang hiện tại nhất." : VIETNAMESE.enterAction}
            className="flex-grow w-full p-2 sm:p-2.5 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-400"
            disabled={isLoadingUi || isSummarizingUi || !isCurrentlyActivePage || !!messageIdBeingEdited}
            />
            <Button type="submit" variant="primary" size="sm" className="px-3 sm:px-4 w-full sm:w-auto flex-shrink-0" disabled={isLoadingUi || isSummarizingUi || playerInput.trim() === "" || !isCurrentlyActivePage || !!messageIdBeingEdited} isLoading={isLoadingUi && !isSummarizingUi} loadingText={VIETNAMESE.sendingAction}>
                {VIETNAMESE.sendInputButton}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default PlayerInputArea;
