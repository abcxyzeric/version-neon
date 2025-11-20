
import { KnowledgeBase, PlayerActionInputType, ResponseLength, GameMessage, GenreType, ViolenceLevel, StoryTone, NsfwDescriptionStyle, DIALOGUE_MARKER, TuChatTier } from '../types';
import { SUB_REALM_NAMES, VIETNAMESE, CUSTOM_GENRE_VALUE, DEFAULT_NSFW_DESCRIPTION_STYLE, DEFAULT_VIOLENCE_LEVEL, DEFAULT_STORY_TONE, NSFW_DESCRIPTION_STYLES, TU_CHAT_TIERS, SPECIAL_EVENT_INTERVAL_TURNS, WEAPON_TYPES_FOR_VO_Y } from '../constants';
import * as GameTemplates from '../templates';
import { continuePromptSystemRules } from '../constants/systemRulesNormal';

export const generateContinuePrompt = (
  knowledgeBase: KnowledgeBase,
  playerActionText: string,
  inputType: PlayerActionInputType,
  responseLength: ResponseLength,
  currentPageMessagesLog: string,
  previousPageSummaries: string[],
  lastNarrationFromPreviousPage?: string,
  retrievedContext?: string // NEW: For RAG
): string => {
  const { worldConfig, worldDate, playerStats, userPrompts } = knowledgeBase;
  const genre = worldConfig?.genre || "Tu Tiên (Mặc định)";
  const customGenreName = worldConfig?.customGenreName;
  const isCultivationEnabled = worldConfig?.isCultivationEnabled !== undefined ? worldConfig.isCultivationEnabled : true;
  const effectiveGenre = (genre === CUSTOM_GENRE_VALUE && customGenreName) ? customGenreName : genre;
  const nsfwMode = worldConfig?.nsfwMode || false;
  const currentNsfwStyle = worldConfig?.nsfwDescriptionStyle || DEFAULT_NSFW_DESCRIPTION_STYLE;
  const currentViolenceLevel = worldConfig?.violenceLevel || DEFAULT_VIOLENCE_LEVEL;
  const currentStoryTone = worldConfig?.storyTone || DEFAULT_STORY_TONE;
  const currentDifficultyName = worldConfig?.difficulty || 'Thường';

  // --- START: CONSTRUCT CORE CONTEXT ---
  // This object contains only the essential, player-centric information that must be in every prompt.
  // Information about the wider world (other NPCs, locations, etc.) should be provided via RAG in `retrievedContext`.
  const coreContext = {
      playerInfo: {
          name: worldConfig?.playerName,
          gender: worldConfig?.playerGender,
          race: worldConfig?.playerRace,
          personality: worldConfig?.playerPersonality,
          backstory: worldConfig?.playerBackstory,
          goal: worldConfig?.playerGoal,
          status: playerStats
      },
      playerAssets: {
          inventory: knowledgeBase.inventory,
          equippedItems: knowledgeBase.equippedItems,
          skills: knowledgeBase.playerSkills,
      },
      playerRelationshipsAndState: {
          quests: knowledgeBase.allQuests.filter(q => q.status === 'active'),
          companions: {
              wives: knowledgeBase.wives,
              slaves: knowledgeBase.slaves,
              prisoners: knowledgeBase.prisoners,
          },
          master: knowledgeBase.master,
      },
      worldState: {
          theme: worldConfig?.theme,
          worldDate: worldDate,
          currentLocation: knowledgeBase.discoveredLocations.find(l => l.id === knowledgeBase.currentLocationId) || null,
          isCultivationEnabled: worldConfig?.isCultivationEnabled,
          realmProgressionSystemForPlayerRace: worldConfig?.raceCultivationSystems.find(s => s.raceName === (worldConfig.playerRace || 'Nhân Tộc'))?.realmSystem,
      }
  };
  // --- END: CONSTRUCT CORE CONTEXT ---

  let difficultyGuidanceText = "";
  switch (currentDifficultyName) {
    case 'Dễ': difficultyGuidanceText = VIETNAMESE.difficultyGuidanceEasy; break;
    case 'Thường': difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNormal; break;
    case 'Khó': difficultyGuidanceText = VIETNAMESE.difficultyGuidanceHard; break;
    case 'Ác Mộng': difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNightmare; break;
    default: difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNormal;
  }

  let nsfwGuidanceCombined = "";
  if (nsfwMode) {
    let nsfwStyleGuidance = "";
    switch (currentNsfwStyle) {
      case 'Hoa Mỹ': nsfwStyleGuidance = VIETNAMESE.nsfwGuidanceHoaMy; break;
      case 'Trần Tục': nsfwStyleGuidance = VIETNAMESE.nsfwGuidanceTranTuc; break;
      case 'Gợi Cảm': nsfwStyleGuidance = VIETNAMESE.nsfwGuidanceGoiCam; break;
      case 'Mạnh Bạo (BDSM)': nsfwStyleGuidance = VIETNAMESE.nsfwGuidanceManhBaoBDSM; break;
      default: nsfwStyleGuidance = VIETNAMESE.nsfwGuidanceHoaMy; 
    }

    let violenceGuidance = "";
    switch (currentViolenceLevel) {
        case 'Nhẹ Nhàng': violenceGuidance = VIETNAMESE.violenceLevelGuidanceNheNhang; break;
        case 'Thực Tế': violenceGuidance = VIETNAMESE.violenceLevelGuidanceThucTe; break;
        case 'Cực Đoan': violenceGuidance = VIETNAMESE.violenceLevelGuidanceCucDoan; break;
        default: violenceGuidance = VIETNAMESE.violenceLevelGuidanceThucTe;
    }

    let toneGuidance = "";
    switch (currentStoryTone) {
        case 'Tích Cực': toneGuidance = VIETNAMESE.storyToneGuidanceTichCuc; break;
        case 'Trung Tính': toneGuidance = VIETNAMESE.storyToneGuidanceTrungTinh; break;
        case 'Đen Tối': toneGuidance = VIETNAMESE.storyToneGuidanceDenToi; break;
        case 'Dâm Dục': toneGuidance = VIETNAMESE.storyToneGuidanceDamDuc; break;
        case 'Hoang Dâm': toneGuidance = VIETNAMESE.storyToneGuidanceHoangDam; break;
        case 'Dâm Loạn': toneGuidance = VIETNAMESE.storyToneGuidanceDamLoan; break;
        default: toneGuidance = VIETNAMESE.storyToneGuidanceTrungTinh;
    }
    nsfwGuidanceCombined = `
**Hướng Dẫn Nội Dung Người Lớn (18+ ĐANG BẬT):**
- **Phong Cách Miêu Tả Tình Dục:** ${currentNsfwStyle}.
  ${nsfwStyleGuidance}
- **Mức Độ Miêu Tả Bạo Lực:** ${currentViolenceLevel}.
  ${violenceGuidance}
- **Tông Màu Câu Chuyện:** ${currentStoryTone}.
  ${toneGuidance}
**LƯU Ý CHUNG KHI 18+ BẬT:** Hãy kết hợp các yếu tố trên để tạo ra trải nghiệm phù hợp.
**YÊU CẦU ĐẶC BIỆT VỀ CẢNH TÌNH DỤC (QUAN TRỌNG):** Khi miêu tả các cảnh quan hệ tình dục, hãy viết một cách **CHI TIẾT, DÀI và MẠNH BẠO** hơn. Đừng ngần ngại đi sâu vào các hành vi thể xác, mô tả cường độ, sự thô bạo (nếu phù hợp với bối cảnh và tông màu), và những cảm xúc mãnh liệt của nhân vật. Tập trung vào sự tương tác vật lý, những âm thanh, và sức mạnh trong từng hành động. Hãy để các cảnh này kéo dài và có sự leo thang về cường độ.`;

  } else {
    nsfwGuidanceCombined = "LƯU Ý QUAN TRỌNG: Chế độ Người Lớn đang TẮT. Tiếp tục duy trì nội dung phù hợp với mọi lứa tuổi, tập trung vào phiêu lưu và phát triển nhân vật. Tránh các chủ đề nhạy cảm, bạo lực quá mức hoặc tình dục.";
  }
  
  let specialEventInstruction = "";
  if (playerStats.turn > 0 && playerStats.turn % SPECIAL_EVENT_INTERVAL_TURNS === 0) {
      specialEventInstruction = `
**SỰ KIỆN CỐT TRUYỆN ĐẶC BIỆT:**
Lượt chơi hiện tại là ${playerStats.turn}, đây là một mốc quan trọng! Hãy tạo ra một sự kiện bất ngờ hoặc một bước ngoặt lớn liên quan đến mục tiêu chính của nhân vật (${knowledgeBase.worldConfig?.playerGoal || 'không rõ'}) hoặc xung đột trung tâm của thế giới. Sự kiện này nên thay đổi cục diện hiện tại và tạo ra những cơ hội hoặc thách thức mới cho người chơi.
`;
  }

  const userPromptsSection = (userPrompts && userPrompts.length > 0)
    ? `
**LỜI NHẮC TỪ NGƯỜI CHƠI (QUY TẮC BẮT BUỘC TUÂN THỦ):**
Đây là những quy tắc do người chơi đặt ra. Bạn **BẮT BUỘC PHẢI** tuân theo những lời nhắc này một cách nghiêm ngặt trong mọi phản hồi.
${userPrompts.map(p => `- ${p}`).join('\n')}
`
    : '';

  const mainRealms = (coreContext.worldState.realmProgressionSystemForPlayerRace || '').split(' - ').map(s => s.trim()).filter(Boolean);


  return `
**YÊU CẦU CỐT LÕI:** Nhiệm vụ của bạn là tiếp tục câu chuyện game nhập vai thể loại "${effectiveGenre}" bằng tiếng Việt một cách liền mạch và hấp dẫn.
**QUY TẮC QUAN TRỌNG NHẤT:** Bắt đầu phản hồi của bạn bằng cách đi thẳng vào lời kể về những gì xảy ra do hành động của người chơi. **TUYỆT ĐỐI KHÔNG** bắt đầu bằng cách bình luận về lựa chọn của người chơi (ví dụ: KHÔNG dùng "Tốt lắm, ngươi đã chọn...", "Đây là một lựa chọn thú vị..."). Hãy kể trực tiếp kết quả.

---
**PHẦN 1: BỐI CẢNH (CONTEXT)**
Đây là thông tin nền để bạn hiểu câu chuyện.

**A. BỐI CẢNH TRUY XUẤT (RAG CONTEXT - LONG-TERM MEMORY):**
Dưới đây là một số thông tin liên quan từ các sự kiện trong quá khứ có thể hữu ích cho lượt này. Hãy sử dụng nó để đảm bảo tính nhất quán của câu chuyện.
${retrievedContext ? `\`\`\`\n${retrievedContext}\n\`\`\`` : "Không có bối cảnh truy xuất nào."}

**B. BỐI CẢNH CỐT LÕI (CORE CONTEXT - PLAYER'S CURRENT STATE):**
Đây là trạng thái hiện tại của người chơi và những yếu tố trực tiếp liên quan đến họ. Thông tin này LUÔN ĐÚNG và phải được ưu tiên hàng đầu. Các thông tin khác về thế giới (NPC khác, địa điểm khác,...) sẽ được cung cấp trong BỐI CẢNH TRUY XUẤT nếu có liên quan.
\`\`\`json
${JSON.stringify(coreContext, null, 2)}
\`\`\`

**C. BỐI CẢNH HỘI THOẠI (CONVERSATIONAL CONTEXT - SHORT-TERM MEMORY):**
- **Tóm tắt các diễn biến trang trước:**
${previousPageSummaries.length > 0 ? previousPageSummaries.join("\n\n") : "Không có tóm tắt từ các trang trước."}
- **Diễn biến gần nhất (lượt trước - Lượt ${playerStats.turn}):**
${lastNarrationFromPreviousPage || "Chưa có."}
- **Diễn biến chi tiết trang hiện tại (từ lượt đầu trang đến lượt ${playerStats.turn}):**
${currentPageMessagesLog || "Chưa có diễn biến nào trong trang này."}

---
**PHẦN 2: HƯỚNG DẪN HÀNH ĐỘNG**

${userPromptsSection}

**HÀNH ĐỘNG CỦA NGƯỜI CHƠI (CHO LƯỢT TIẾP THEO - LƯỢT ${playerStats.turn + 1}):**
- **Loại hướng dẫn:** ${inputType === 'action' ? 'Hành động trực tiếp của nhân vật' : 'Gợi ý/Mô tả câu chuyện (do người chơi cung cấp)'}
- **Nội dung hướng dẫn:** "${playerActionText}"

${specialEventInstruction}

**HƯỚN DẪN XỬ LÝ DÀNH CHO AI:**
${inputType === 'action'
    ? `Xử lý nội dung trên như một hành động mà nhân vật chính đang thực hiện. Mô tả kết quả của hành động này và các diễn biến tiếp theo một cách chi tiết và hấp dẫn, dựa trên TOÀN BỘ BỐI CẢNH. Kết quả thành công hay thất bại PHẢI dựa trên Tỉ Lệ Thành Công bạn đã thiết lập cho lựa chọn đó (nếu là lựa chọn của AI) hoặc một tỉ lệ hợp lý do bạn quyết định (nếu là hành động tự do), có tính đến Độ Khó của game. Mô tả rõ ràng phần thưởng/lợi ích khi thành công hoặc tác hại/rủi ro khi thất bại.`
    : `Nội dung trên là một gợi ý, mô tả, hoặc mong muốn của người chơi để định hướng hoặc làm phong phú thêm câu chuyện. Đây KHÔNG phải là hành động trực tiếp của nhân vật chính. **NHIỆM VỤ CỦA BẠN LÀ BẮT BUỘC PHẢI LÀM CHO DIỄN BIẾN NÀY XẢY RA TRONG LƯỢT TIẾP THEO.** Hãy tìm một cách tự nhiên và hợp lý nhất để hợp thức hóa sự kiện này trong bối cảnh hiện tại. Sau khi mô tả sự kiện này đã xảy ra, hãy cung cấp các lựa chọn [CHOICE: "..."] để người chơi phản ứng với tình huống mới.`
  }

---
**PHẦN 3: QUY TẮC VÀ HƯỚNG DẪN CHI TIẾT**
Đây là các quy tắc bạn phải tuân theo để tạo ra phản hồi hợp lệ.

**A. HƯỚN DẪN VỀ ĐỘ KHÓ:**
- **Dễ:** ${difficultyGuidanceText} Tỉ lệ thành công cho lựa chọn thường CAO (ví dụ: 70-95%).
- **Thường:** ${difficultyGuidanceText} Tỉ lệ thành công cho lựa chọn TRUNG BÌNH (ví dụ: 50-80%).
- **Khó:** ${difficultyGuidanceText} Tỉ lệ thành công cho lựa chọn THẤP (ví dụ: 30-65%).
- **Ác Mộng:** ${difficultyGuidanceText} Tỉ lệ thành công cho lựa chọn CỰC KỲ THẤP (ví dụ: 15-50%).
**Độ khó hiện tại:** **${currentDifficultyName}**. Hãy điều chỉnh các lựa chọn [CHOICE: "..."] và kết quả cho phù hợp.

**B. CHẾ ĐỘ NỘI DUNG VÀ PHONG CÁCH:**
${nsfwGuidanceCombined}

**C. ĐỘ DÀI VÀ CHI TIẾT PHẢN HỒI (YÊU CẦU CỰC KỲ QUAN TRỌNG):**
- **YÊU CẦU ĐẶC BIỆT CỦA NGƯỜI CHƠI:** Người chơi muốn trải nghiệm một cuốn tiểu thuyết tương tác có chiều sâu. Mỗi phản hồi của bạn phải cực kỳ dài, chi tiết, và văn chương. Hãy viết như đang viết một chương truyện đầy đủ, với mục tiêu độ dài **ít nhất 2000 từ**, và lý tưởng là nhiều hơn nữa, đến 10000 từ nếu có thể.
- **Mô tả chi tiết:**
  - **Môi trường:** Đừng chỉ nói "trong rừng". Hãy tả tiếng lá xào xạc, mùi đất ẩm, ánh nắng xuyên qua kẽ lá, cảm giác của nhân vật về không khí xung quanh.
  - **Nội tâm:** Đi sâu vào suy nghĩ, cảm xúc, ký ức, và kế hoạch của nhân vật chính.
  - **Hành động:** Mô tả từng cử chỉ, hành động một cách chi tiết, từ cái nhíu mày đến cách họ nắm chặt chuôi kiếm.
  - **Hội thoại:** Kéo dài các cuộc đối thoại, thêm vào những khoảng lặng, những cử chỉ phi ngôn ngữ, và những suy nghĩ nội tâm của nhân vật trong lúc nói chuyện.
- **Độ dài mong muốn cụ thể:** Người chơi đã chọn: ${
    responseLength === 'short' ? 'Ngắn (vẫn phải rất chi tiết, khoảng 500+ từ)' :
    responseLength === 'medium' ? 'Trung bình (cực kỳ chi tiết, khoảng 1000+ từ)' :
    responseLength === 'long' ? 'RẤT DÀI (như một chương truyện, trên 2000 từ, lý tưởng là 10000 từ nếu có thể)' :
    'Mặc định (chi tiết, khoảng 800+ từ)'
}.
**MỤC TIÊU CUỐI CÙNG:** Biến mỗi lượt chơi thành một chương truyện có thể đọc được, phong phú và sâu sắc. Đừng ngần ngại viết dài.

**D. CÁC QUY TẮC SỬ DỤNG TAG (CỰC KỲ QUAN TRỌNG):**
${continuePromptSystemRules(worldConfig, mainRealms)}

**TIẾP TỤC CÂU CHUYỆN:** Dựa trên **HƯỚN DẪN TỪ NGƯỜI CHƠI**, **ĐỘ DÀI PHẢN HỒI MONG MUỐN** và **TOÀN BỘ BỐI CẢNH GAME**, hãy tiếp tục câu chuyện cho thể loại "${effectiveGenre}". Mô tả kết quả, cập nhật trạng thái game bằng tags, và cung cấp các lựa chọn hành động mới (theo định dạng đã hướng dẫn ở mục 17).
`;
};
