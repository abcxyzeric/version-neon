
import { WorldSettings, StartingItem, GenreType, ViolenceLevel, StoryTone, DIALOGUE_MARKER, TuChatTier, StartingSkill } from '../types';
import { SUB_REALM_NAMES, VIETNAMESE, AVAILABLE_GENRES, CUSTOM_GENRE_VALUE, DEFAULT_NSFW_DESCRIPTION_STYLE, NSFW_DESCRIPTION_STYLES, DEFAULT_VIOLENCE_LEVEL, DEFAULT_STORY_TONE, TU_CHAT_TIERS, WEAPON_TYPES_FOR_VO_Y } from '../constants';
import * as GameTemplates from '../templates';

const buildSkillTag = (skill: StartingSkill): string => {
    let tag = `[SKILL_LEARNED: name="${skill.name.replace(/"/g, '\\"')}" description="${skill.description.replace(/"/g, '\\"')}" skillType="${skill.skillType || GameTemplates.SkillType.KHAC}"`;

    const otherEffects = skill.specialEffects || skill.description;
    tag += ` otherEffects="${otherEffects.replace(/"/g, '\\"')}"`;

    // Combat stats only if they are relevant and defined
    if (skill.baseDamage) tag += ` baseDamage=${skill.baseDamage}`;
    if (skill.baseHealing) tag += ` baseHealing=${skill.baseHealing}`;
    if (skill.damageMultiplier) tag += ` damageMultiplier=${skill.damageMultiplier}`;
    if (skill.healingMultiplier) tag += ` healingMultiplier=${skill.healingMultiplier}`;
    if (skill.manaCost) tag += ` manaCost=${skill.manaCost}`;
    if (skill.cooldown) tag += ` cooldown=${skill.cooldown}`;

    // Skill-type specific details
    if (skill.congPhapDetails) {
        if (skill.congPhapDetails.type) tag += ` congPhapType="${skill.congPhapDetails.type}"`;
        if (skill.congPhapDetails.grade) tag += ` congPhapGrade="${skill.congPhapDetails.grade}"`;
        if (skill.congPhapDetails.weaponFocus) tag += ` weaponFocus="${skill.congPhapDetails.weaponFocus}"`;
    }
    if (skill.linhKiDetails) {
        if (skill.linhKiDetails.category) tag += ` linhKiCategory="${skill.linhKiDetails.category}"`;
        if (skill.linhKiDetails.activation) tag += ` linhKiActivation="${skill.linhKiDetails.activation}"`;
    }
    if (skill.professionDetails) {
        if (skill.professionDetails.type) tag += ` professionType="${skill.professionDetails.type}"`;
        if (skill.professionDetails.grade) tag += ` professionGrade="${skill.professionDetails.grade}"`;
        if (skill.professionDetails.skillDescription) tag += ` skillDescription="${skill.professionDetails.skillDescription.replace(/"/g, '\\"')}"`;
    }
    if (skill.camThuatDetails?.sideEffects) {
        tag += ` sideEffects="${skill.camThuatDetails.sideEffects.replace(/"/g, '\\"')}"`;
    }

    tag += ']';
    return tag;
};

export const generateInitialPrompt = (worldConfig: WorldSettings): string => {
  const { genre, customGenreName, isCultivationEnabled, raceCultivationSystems, yeuThuRealmSystem, canhGioiKhoiDau, nsfwMode, nsfwDescriptionStyle, violenceLevel, storyTone } = worldConfig;

  const getMainRealms = (realmSystem: string): string[] => {
    return realmSystem.split(' - ').map(s => s.trim()).filter(s => s.length > 0);
  };
  
  let effectiveStartingRealm = VIETNAMESE.mortalRealmName;
  let realmSystemDescription = VIETNAMESE.noCultivationSystem;
  let subRealmNamesInstruction = "";
  const effectiveGenre = (genre === CUSTOM_GENRE_VALUE && customGenreName) ? customGenreName : genre;
  const currentNsfwStyle = nsfwDescriptionStyle || DEFAULT_NSFW_DESCRIPTION_STYLE;
  const currentViolenceLevel = violenceLevel || DEFAULT_VIOLENCE_LEVEL;
  const currentStoryTone = storyTone || DEFAULT_STORY_TONE;
  const mainRealms = getMainRealms(raceCultivationSystems[0]?.realmSystem || '');

  if (isCultivationEnabled) {
    const firstMainRealm = mainRealms.length > 0 ? mainRealms[0] : "Phàm Nhân";
    const defaultStartingRealmCultivation = `${firstMainRealm} ${SUB_REALM_NAMES[0]}`;
    effectiveStartingRealm = canhGioiKhoiDau || defaultStartingRealmCultivation;
    realmSystemDescription = `"${raceCultivationSystems.map(s => `${s.raceName}: ${s.realmSystem}`).join('; ')}" (Ví dụ: "Phàm Nhân - Luyện Khí - Trúc Cơ - Kim Đan - Nguyên Anh - Hóa Thần - Luyện Hư - Hợp Thể - Đại Thừa - Độ Kiếp")`;
    subRealmNamesInstruction = `Mỗi cảnh giới lớn (nếu có trong thể loại này) sẽ có 10 cấp độ phụ: ${SUB_REALM_NAMES.join(', ')}.`;
  }

  let difficultyGuidanceText = ""; 
  switch (worldConfig.difficulty) {
    case 'Dễ':
      difficultyGuidanceText = VIETNAMESE.difficultyGuidanceEasy;
      break;
    case 'Thường':
      difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNormal;
      break;
    case 'Khó':
      difficultyGuidanceText = VIETNAMESE.difficultyGuidanceHard;
      break;
    case 'Ác Mộng':
      difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNightmare;
      break;
    default:
      difficultyGuidanceText = VIETNAMESE.difficultyGuidanceNormal;
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
**LƯU Ý CHUNG KHI 18+ BẬT:** Hãy kết hợp các yếu tố trên để tạo ra trải nghiệm phù hợp.`;

  } else {
    nsfwGuidanceCombined = "LƯU Ý QUAN TRỌNG: Chế độ Người Lớn đã được TẮT. Vui lòng duy trì nội dung phù hợp với mọi lứa tuổi, tập trung vào phiêu lưu và phát triển nhân vật. Tránh các chủ đề nhạy cảm, bạo lực quá mức hoặc tình dục.";
  }

  return `**YÊU CẦU CỐT LÕI:** Bắt đầu một câu chuyện game nhập vai thể loại "${effectiveGenre}" bằng tiếng Việt. Tạo ra một thế giới sống động và một cốt truyện mở đầu hấp dẫn dựa trên thông tin do người chơi cung cấp. Bắt đầu lời kể ngay lập tức, không có lời dẫn hay tự xưng là người kể chuyện.
${isCultivationEnabled ? subRealmNamesInstruction : ''}

**YÊU CẦU VỀ ĐỘ DÀI VÀ CHI TIẾT (CỰC KỲ QUAN TRỌNG):**
Phản hồi đầu tiên của bạn phải là một đoạn văn tự sự cực kỳ dài và chi tiết, giống như chương mở đầu của một cuốn tiểu thuyết sử thi. Hãy đặt mục tiêu viết một đoạn văn dài **ít nhất 2000 từ**, và lý tưởng là nhiều hơn nữa, đến 10000 từ nếu có thể, để thiết lập thế giới và bối cảnh một cách sâu sắc nhất có thể. Đừng vội vàng đi vào hành động. Hãy dành thời gian để:
- **Mô tả chi tiết môi trường:** Cảnh vật, âm thanh, mùi vị, không khí tại địa điểm bắt đầu.
- **Khám phá nội tâm nhân vật:** Suy nghĩ, cảm xúc, ký ức, và những cảm nhận ban đầu của họ về tình huống hiện tại.
- **Thiết lập không khí:** Tạo ra một không khí phù hợp với thể loại và bối cảnh (hùng vĩ, u ám, bí ẩn, v.v.).
- **Giới thiệu các yếu tố xung quanh:** Mô tả các chi tiết nhỏ, những nhân vật phụ (nếu có), hoặc những dấu hiệu về một câu chuyện lớn hơn.
Mục tiêu là khiến người chơi hoàn toàn đắm chìm vào thế giới ngay từ những dòng chữ đầu tiên. Hãy viết một cách văn chương và đừng ngần ngại sự dài dòng, chi tiết.

**THÔNG TIN THẾ GIỚI VÀ NHÂN VẬT:**
Thể loại: ${effectiveGenre} ${(genre === CUSTOM_GENRE_VALUE && customGenreName) ? `(Người chơi tự định nghĩa)` : `(Từ danh sách)`}
Hệ Thống Tu Luyện/Sức Mạnh Đặc Thù: ${isCultivationEnabled ? "BẬT" : "TẮT"}
Thế giới:
- Chủ đề: ${worldConfig.theme}
- Bối cảnh: ${worldConfig.settingDescription}
- Văn phong: ${worldConfig.writingStyle}
- Độ khó: ${worldConfig.difficulty}
- Tiền tệ: ${worldConfig.currencyName}
${isCultivationEnabled ? `- Hệ Thống Cảnh Giới (do người chơi hoặc AI thiết lập): ${realmSystemDescription}` : ''}
${isCultivationEnabled ? `- Hệ Thống Cảnh Giới Yêu Thú: "${yeuThuRealmSystem}"` : ''}
${isCultivationEnabled ? `- Cảnh Giới Khởi Đầu (do người chơi hoặc AI thiết lập): "${effectiveStartingRealm}" (LƯU Ý: PHẢI LÀ MỘT CẢNH GIỚI HỢP LỆ TỪ HỆ THỐNG CẢNH GIỚI VÀ ${SUB_REALM_NAMES.join('/')})` : `- Cấp Độ/Trạng Thái Khởi Đầu: "${effectiveStartingRealm}" (Người thường)`}
${worldConfig.originalStorySummary ? `- TÓM TẮT CỐT TRUYỆN NGUYÊN TÁC (ĐỒNG NHÂN): """${worldConfig.originalStorySummary}"""` : ''}

Nhân vật:
- Tên: ${worldConfig.playerName}
- Giới tính: ${worldConfig.playerGender}
- Tính cách: ${worldConfig.playerPersonality}
- Tiểu sử: ${worldConfig.playerBackstory}
- Mục tiêu: ${worldConfig.playerGoal}
- Đặc điểm khởi đầu chung (nếu có): ${worldConfig.playerStartingTraits}
- Linh Căn: ${worldConfig.playerSpiritualRoot || 'AI sẽ quyết định'}
- Thể Chất Đặc Biệt: ${worldConfig.playerSpecialPhysique || 'AI sẽ quyết định'}
- Kỹ năng khởi đầu cụ thể:
${worldConfig.startingSkills && worldConfig.startingSkills.length > 0 ? worldConfig.startingSkills.map(buildSkillTag).join('\n') : "  Không có kỹ năng khởi đầu cụ thể."}
- Vật phẩm khởi đầu cụ thể:
${worldConfig.startingItems && worldConfig.startingItems.length > 0 ? worldConfig.startingItems.map(item => `  - ${item.name} (x${item.quantity}, Loại: ${item.category}${item.equipmentDetails?.type ? ' - ' + item.equipmentDetails.type : item.potionDetails?.type ? ' - ' + item.potionDetails.type : item.materialDetails?.type ? ' - ' + item.materialDetails.type : ''}): ${item.description}`).join('\n') : "  Không có vật phẩm khởi đầu cụ thể."}
- NPC khởi đầu cụ thể:
${worldConfig.startingNPCs && worldConfig.startingNPCs.length > 0 ? worldConfig.startingNPCs.map(npc => `  - Tên: ${npc.name}, Giới tính: ${npc.gender || 'Không rõ'}, Chủng tộc: ${npc.race || 'Không rõ'}, Tính cách: ${npc.personality}, Độ thiện cảm ban đầu: ${npc.initialAffinity}, Chi tiết: ${npc.details}${isCultivationEnabled && npc.realm ? `, Cảnh giới: ${npc.realm}` : ''}${isCultivationEnabled && npc.tuChat ? `, Tư chất: ${npc.tuChat}` : ''}${npc.relationshipToPlayer ? `, Mối quan hệ: ${npc.relationshipToPlayer}` : ''}${isCultivationEnabled && npc.thoNguyen && npc.maxThoNguyen ? `, Thọ nguyên: ${npc.thoNguyen}/${npc.maxThoNguyen}` : ''}`).join('\n') : "  Không có NPC khởi đầu cụ thể."}
- Yêu Thú khởi đầu cụ thể:
${worldConfig.startingYeuThu && worldConfig.startingYeuThu.length > 0 ? worldConfig.startingYeuThu.map(yt => `  - Tên: ${yt.name}, Loài: ${yt.species}, Mô tả: ${yt.description}, Cảnh giới: ${yt.realm}, Thù địch: ${yt.isHostile}`).join('\n') : "  Không có Yêu Thú khởi đầu cụ thể."}
- Tri thức thế giới khởi đầu cụ thể:
${worldConfig.startingLore && worldConfig.startingLore.length > 0 ? worldConfig.startingLore.map(lore => `  - Tiêu đề: ${lore.title}, Nội dung: ${lore.content}`).join('\n') : "  Không có tri thức thế giới khởi đầu cụ thể."}
- Địa điểm khởi đầu cụ thể:
${worldConfig.startingLocations && worldConfig.startingLocations.length > 0 ? worldConfig.startingLocations.map(loc => `  - Tên: ${loc.name}, Mô tả: ${loc.description}, Loại: ${loc.locationType || 'Mặc định'}${loc.isSafeZone ? ' (Khu An Toàn)' : ''}${loc.regionId ? `, Vùng: ${loc.regionId}` : ''}${loc.mapX !== undefined ? `, mapX: ${loc.mapX}` : ''}${loc.mapY !== undefined ? `, mapY: ${loc.mapY}` : ''}`).join('\n') : "  Không có địa điểm khởi đầu cụ thể."}
- Phe phái khởi đầu cụ thể:
${worldConfig.startingFactions && worldConfig.startingFactions.length > 0 ? worldConfig.startingFactions.map(fac => `  - Tên: ${fac.name}, Mô tả: ${fac.description}, Chính/Tà: ${fac.alignment}, Uy tín ban đầu: ${fac.initialPlayerReputation}`).join('\n') : "  Không có phe phái khởi đầu cụ thể."}

**HƯỚNG DẪN VỀ ĐỘ KHÓ (Rất quan trọng để AI tuân theo):**
- **Dễ:** ${VIETNAMESE.difficultyGuidanceEasy} Tỉ lệ thành công cho lựa chọn thường CAO (ví dụ: 70-95%). Rủi ro thấp, phần thưởng dễ đạt.
- **Thường:** ${VIETNAMESE.difficultyGuidanceNormal} Tỉ lệ thành công cho lựa chọn TRUNG BÌNH (ví dụ: 50-80%). Rủi ro và phần thưởng cân bằng.
- **Khó:** ${VIETNAMESE.difficultyGuidanceHard} Tỉ lệ thành công cho lựa chọn THẤP (ví dụ: 30-65%). Rủi ro cao, phần thưởng lớn nhưng khó kiếm.
- **Ác Mộng:** ${VIETNAMESE.difficultyGuidanceNightmare} Tỉ lệ thành công cho lựa chọn CỰC KỲ THẤP (ví dụ: 15-50%). Rủi ro rất lớn, phần thưởng cực kỳ hiếm hoi.
Hiện tại người chơi đã chọn độ khó: **${worldConfig.difficulty}**. Hãy điều chỉnh tỉ lệ thành công, lợi ích và rủi ro trong các lựa chọn [CHOICE: "..."] của bạn cho phù hợp với hướng dẫn độ khó này.

**CHẾ ĐỘ NỘI DUNG VÀ PHONG CÁCH:**
${nsfwGuidanceCombined}

**QUY TẮC HỆ THỐNG (CHO VIỆC KHỞI TẠO BAN ĐẦU):**
1.  **Khởi tạo Chỉ số Nhân Vật:** Dựa vào thông tin trên, hãy quyết định các chỉ số ban đầu cho nhân vật. Trả về dưới dạng tag \\\`[PLAYER_STATS_INIT: sinhLuc=X,${isCultivationEnabled ? 'linhLuc=Y,thoNguyen=A,maxThoNguyen=B,' : ''}kinhNghiem=0,realm="${effectiveStartingRealm}",currency=${worldConfig.startingCurrency},turn=1${isCultivationEnabled ? `,hieuUngBinhCanh=false,spiritualRoot="${worldConfig.playerSpiritualRoot || 'Phàm Căn'}",specialPhysique="${worldConfig.playerSpecialPhysique || 'Phàm Thể'}"` : ''}]\`\\\`.
    **QUAN TRỌNG:**
    *   \\\`realm\\\` PHẢI LÀ "${effectiveStartingRealm}". ĐÂY LÀ GIÁ TRỊ CHÍNH XÁC, KHÔNG ĐƯỢC THAY ĐỔI HAY RÚT GỌN (ví dụ: không dùng "Phàm" thay vì "Phàm Nhân Nhất Trọng").
    *   Lượt chơi (turn) phải bắt đầu từ 1.
    *   ${isCultivationEnabled ? '`thoNguyen` (thọ nguyên còn lại) và `maxThoNguyen` (thọ nguyên tối đa) nên có giá trị khởi đầu hợp lý (ví dụ, tu sĩ cấp thấp có thể sống 120-150 năm).' : ''}
    *   **AI KHÔNG cần cung cấp \\\`maxSinhLuc\\\`${isCultivationEnabled ? ', \\\`maxLinhLuc\\\`, \\\`maxKinhNghiem\\\`' : ''}, \\\`sucTanCong\\\`. Hệ thống game sẽ tự động tính toán các chỉ số này dựa trên \\\`realm\\\` bạn cung cấp${isCultivationEnabled ? '' : ' (hoặc mặc định cho người thường)'}.**
    *   \\\`sinhLuc\\\` ${isCultivationEnabled ? 'và \\\`linhLuc\\\` ' : ''}nên được đặt bằng giá trị tối đa tương ứng với cảnh giới/cấp độ khởi đầu, hoặc một giá trị hợp lý nếu bạn muốn nhân vật khởi đầu không đầy. Nếu muốn hồi đầy, dùng \\\`sinhLuc=MAX\\\` ${isCultivationEnabled ? 'và \\\`linhLuc=MAX\\\`' : ''}.
    *   \\\`kinhNghiem\\\` thường là 0 (nếu có). \\\`currency\\\` là số tiền ban đầu. Giá trị đã được người chơi thiết lập là **${worldConfig.startingCurrency}**. AI phải sử dụng chính xác con số này.
    *   Ví dụ (nếu có tu luyện): \\\`[PLAYER_STATS_INIT: sinhLuc=MAX,linhLuc=MAX,thoNguyen=120,maxThoNguyen=120,kinhNghiem=0,realm="${effectiveStartingRealm}",currency=${worldConfig.startingCurrency},turn=1,hieuUngBinhCanh=false,spiritualRoot="Ngũ Hành Tạp Linh Căn",specialPhysique="Bình Thường Phàm Thể"]\`\\\`.
    *   Ví dụ (nếu KHÔNG có tu luyện): \\\`[PLAYER_STATS_INIT: sinhLuc=MAX,thoNguyen=80,maxThoNguyen=80,kinhNghiem=0,realm="${VIETNAMESE.mortalRealmName}",currency=${worldConfig.startingCurrency},turn=1]\`\\\`.
${isCultivationEnabled ? `2.  **Xác nhận Hệ thống Cảnh giới:** Hệ thống cảnh giới người chơi đã định nghĩa là: "${realmSystemDescription}". Hãy sử dụng hệ thống này. Nếu bạn muốn thay đổi hoặc đề xuất một danh sách hoàn toàn mới dựa trên chủ đề, hãy dùng tag \\\`[GENERATED_RACE_SYSTEM: race="Tên Chủng Tộc", system="Hệ thống mới..."]\\\`. Nếu không, không cần tag này.` : '2.  **Hệ Thống Cảnh Giới:** Đã TẮT. Nhân vật là người thường.'}
3.  **Vật phẩm, Kỹ năng, NPC, Địa Điểm, Phe Phái và Tri Thức Khởi đầu:** Dựa trên thông tin do người chơi cung cấp, hãy tạo các tag tương ứng. **Cố gắng cung cấp đầy đủ thông tin để hệ thống game có thể tạo ra các thực thể đầy đủ theo định nghĩa cấu trúc dữ liệu của game.**
    **CẤM TUYỆT ĐỐI VỀ VẬT PHẨM TIỀN TỆ:** Đơn vị tiền tệ của thế giới là "${worldConfig.currencyName}". Bạn **TUYỆT ĐỐI KHÔNG** được tạo ra bất kỳ vật phẩm nào có chức năng tương tự tiền tệ (ví dụ: "Linh Thạch Hạ Phẩm", "Túi Vàng", "Ngân Phiếu") bằng tag \`[ITEM_ACQUIRED]\`. Việc này sẽ phá vỡ hệ thống kinh tế của game. Số dư tiền tệ của người chơi đã được quản lý riêng và đã được thiết lập trong tag \`[PLAYER_STATS_INIT]\`.
    *   **Vật phẩm:** Sử dụng tag \\\`[ITEM_ACQUIRED: name="Tên", type="LOẠI CHÍNH + LOẠI PHỤ (NẾU CÓ)", description="Mô tả", quantity=SốLượng, rarity="Độ hiếm", value=GiáTrị, itemRealm="Tên Đại Cảnh Giới Chỉ được là đại cảnh giới của nhân tộc thôi)", ... (các thuộc tính khác tùy loại)]\`\\\`.
        *   \`type\`: Phải bao gồm **Loại Chính** và **Loại Phụ** (nếu có).
            *   **Các Loại Chính Hợp Lệ:** ${Object.values(GameTemplates.ItemCategory).join(' | ')}.
            *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.EQUIPMENT}\`, thì Loại Phụ (\`equipmentType\`) PHẢI LÀ MỘT TRONG CÁC LOẠI TRANG BỊ SAU: ${Object.values(GameTemplates.EquipmentType).join(' | ')}. Ví dụ: \`type="${GameTemplates.ItemCategory.EQUIPMENT} ${GameTemplates.EquipmentType.VU_KHI}"\`. LƯU Ý: "Loại Phụ" cho trang bị (\`equipmentType\`) này KHÁC với "Vị trí trang bị" (\`slot\`). Ví dụ, một vật phẩm có \`equipmentType="${GameTemplates.EquipmentType.VU_KHI}"\` có thể được trang bị vào \`slot="Vũ Khí Chính"\` hoặc \`slot="Vũ Khí Phụ/Khiên"\`. Đừng nhầm lẫn tên vị trí với \`equipmentType\` hợp lệ. Tham số \`equipmentType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho trang bị. Thuộc tính \`statBonusesJSON\` LÀ BẮT BUỘC (nếu không có, dùng \`statBonusesJSON='{}'\`). Thuộc tính \`uniqueEffectsList\` LÀ BẮT BUỘC (nếu không có, dùng \`uniqueEffectsList="Không có gì đặc biệt"\`).
            *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.POTION}\`, thì Loại Phụ (\`potionType\`) PHẢI LÀ MỘT TRONG CÁC LOẠI ĐAN DƯỢC SAU: ${Object.values(GameTemplates.PotionType).join(' | ')}. Ví dụ: \`type="${GameTemplates.ItemCategory.POTION} ${GameTemplates.PotionType.HOI_PHUC}"\`. **Nếu là đan dược hỗ trợ, tăng cường chỉ số tạm thời, hoặc gây hiệu ứng đặc biệt không phải hồi phục hay giải độc, hãy dùng loại \`${GameTemplates.PotionType.DAC_BIET}\` và mô tả rõ hiệu ứng trong \`effectsList\`**. Tham số \`potionType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho đan dược.
            *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.MATERIAL}\`, thì Loại Phụ PHẢI LÀ MỘT TRONG CÁC LOẠI NGUYÊN LIỆU SAU: ${Object.values(GameTemplates.MaterialType).join(' | ')}. Ví dụ: \`type="${GameTemplates.ItemCategory.MATERIAL} ${GameTemplates.MaterialType.LINH_THAO}"\`. Tham số \`materialType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho nguyên liệu.
            *   **Loại mới:** \`${GameTemplates.ItemCategory.CONG_PHAP}\` (Dùng để học Công Pháp), \`${GameTemplates.ItemCategory.LINH_KI}\` (Dùng để học Linh Kĩ), \`${GameTemplates.ItemCategory.PROFESSION_SKILL_BOOK}\` (Học nghề), \`${GameTemplates.ItemCategory.PROFESSION_TOOL}\` (Dụng cụ nghề).
        *   \`itemRealm\`: BẮT BUỘC. Đây là cảnh giới/cấp độ của vật phẩm, quyết định sức mạnh và giá trị của nó. **PHẢI** là một trong các cảnh giới lớn bạn đã tạo trong hệ thống cảnh giới: \`${mainRealms.join(' | ')}\`.
        *   **QUAN TRỌNG về \`statBonusesJSON\` (cho Trang Bị):** LÀ BẮT BUỘC. Phải là một chuỗi JSON hợp lệ. Các khóa trong JSON phải là các thuộc tính của người chơi như: \`maxSinhLuc\`, \`maxLinhLuc\`, \`sucTanCong\`. Ví dụ: \`statBonusesJSON='{"sucTanCong": 10, "maxSinhLuc": 50}'\`. **Nếu không có chỉ số cộng thêm, PHẢI ĐỂ LÀ \`statBonusesJSON='{}'\`.**
        *   **QUAN TRỌNG về \`uniqueEffectsList\` (cho Trang Bị):** LÀ BẮT BUỘC. Danh sách hiệu ứng đặc biệt, cách nhau bởi dấu ';'. Ví dụ: \`uniqueEffectsList="Hút máu 5%;Tăng tốc"\`. **Nếu không có hiệu ứng đặc biệt, PHẢI ĐỂ LÀ \`uniqueEffectsList="Không có gì đặc biệt"\`.**
        *   **Tham số cho Loại Mới:**
            *   Đối với \`${GameTemplates.ItemCategory.CONG_PHAP}\`, thêm \`congPhapType="${Object.values(GameTemplates.CongPhapType).join('|')}"\` và \`expBonusPercentage=X\` (số nguyên, % kinh nghiệm tu luyện được cộng thêm).
            *   Đối với \`${GameTemplates.ItemCategory.LINH_KI}\`, thêm \`skillToLearnJSON='{"name":"Tên Skill", "description":"Mô tả", "skillType":"Linh Kĩ", "detailedEffect":"Hiệu ứng chi tiết", ...}'\`. JSON phải hợp lệ.
            *   Đối với \`${GameTemplates.ItemCategory.PROFESSION_SKILL_BOOK}\`, thêm \`professionToLearn="${Object.values(GameTemplates.ProfessionType).join('|')}"\`.
            *   Đối với \`${GameTemplates.ItemCategory.PROFESSION_TOOL}\`, thêm \`professionRequired="${Object.values(GameTemplates.ProfessionType).join('|')}"\`.
        *   Ví dụ hoàn chỉnh cho trang bị: \\\`[ITEM_ACQUIRED: name="Trường Kiếm Sắt", type="${GameTemplates.ItemCategory.EQUIPMENT} ${GameTemplates.EquipmentType.VU_KHI}", equipmentType="${GameTemplates.EquipmentType.VU_KHI}", description="Một thanh trường kiếm bằng sắt rèn.", statBonusesJSON='{"sucTanCong": 5}', uniqueEffectsList="Không có gì đặc biệt", quantity=1, rarity="Phổ Thông", value=10, itemRealm="Phàm Nhân", slot="Vũ Khí Chính"]\\\`.
        ${worldConfig.startingItems && worldConfig.startingItems.map(item => `[ITEM_ACQUIRED: name="${item.name.replace(/"/g, '\\"')}",type="${item.aiPreliminaryType || (item.category + (item.equipmentDetails?.type ? ' ' + item.equipmentDetails.type : item.potionDetails?.type ? ' ' + item.potionDetails.type : item.materialDetails?.type ? ' ' + item.materialDetails.type : ''))}",description="${item.description.replace(/"/g, '\\"')}",quantity=${item.quantity}, rarity="${item.rarity || 'Phổ Thông'}", value=${item.value || 0}, itemRealm="${item.itemRealm || 'Phàm Nhân'}"${item.equipmentDetails?.type ? `, equipmentType="${item.equipmentDetails.type}"` : ''}${item.equipmentDetails?.statBonusesString ? `, statBonusesJSON='${item.equipmentDetails.statBonusesString.replace(/'/g, '"')}'` : (item.category === GameTemplates.ItemCategory.EQUIPMENT ? `, statBonusesJSON='{}'` : '')}${item.equipmentDetails?.uniqueEffectsString ? `, uniqueEffectsList="${item.equipmentDetails.uniqueEffectsString.replace(/"/g, '\\"')}"` : (item.category === GameTemplates.ItemCategory.EQUIPMENT ? `, uniqueEffectsList="Không có gì đặc biệt"` : '')}${item.equipmentDetails?.slot ? `, slot="${item.equipmentDetails.slot.replace(/"/g, '\\"')}"` : ''}${item.potionDetails?.type ? `, potionType="${item.potionDetails.type}"` : ''}${item.potionDetails?.effectsString ? `, effectsList="${item.potionDetails.effectsString.replace(/"/g, '\\"')}"` : ''}${item.materialDetails?.type ? `, materialType="${item.materialDetails.type}"` : ''}]`).join('\n')}
    *   **Kỹ năng:** Sử dụng tag \\\`[SKILL_LEARNED: ...]\`\\\`. Cung cấp đầy đủ các thuộc tính dựa trên \`skillType\`.
        - **Thuộc tính chung (BẮT BUỘC cho mọi loại):** \`name\`, \`description\`, \`skillType="CHỌN MỘT TRONG: ${Object.values(GameTemplates.SkillType).join(' | ')}"\`.
        - **Nếu \`skillType="${GameTemplates.SkillType.CONG_PHAP_TU_LUYEN}"\`:**
            - Cần thêm: \`congPhapType="(${Object.values(GameTemplates.CongPhapType).join('|')})"\`, \`congPhapGrade="(${GameTemplates.CONG_PHAP_GRADES.join('|')})"\`.
            - Nếu \`congPhapType="${GameTemplates.CongPhapType.VO_Y}"\`, thêm \`weaponFocus="(${WEAPON_TYPES_FOR_VO_Y.join('|')})"\`.
            - Ví dụ: \\\`[SKILL_LEARNED: name="Kim Cang Quyết", description="Một công pháp luyện thể sơ cấp.", skillType="${GameTemplates.SkillType.CONG_PHAP_TU_LUYEN}", congPhapType="Thể Tu", congPhapGrade="Hoàng Phẩm"]\`\\\`
        - **Nếu \`skillType="${GameTemplates.SkillType.LINH_KI}"\`:**
            - Cần thêm: \`linhKiCategory="(${GameTemplates.LINH_KI_CATEGORIES.join('|')})"\`, \`linhKiActivation="(${GameTemplates.LINH_KI_ACTIVATION_TYPES.join('|')})"\`.
            - Nếu \`linhKiActivation="Chủ động"\`, thêm các thuộc tính chiến đấu.
            - Ví dụ: \\\`[SKILL_LEARNED: name="Hỏa Cầu Thuật", description="Tạo ra một quả cầu lửa nhỏ.", skillType="${GameTemplates.SkillType.LINH_KI}", linhKiCategory="Tấn công", linhKiActivation="Chủ động", manaCost=10, cooldown=1, baseDamage=20, otherEffects="Gây hiệu ứng Bỏng trong 2 lượt"]\`\\\`
        - **Nếu \`skillType="${GameTemplates.SkillType.THAN_THONG}"\`:**
            - Thêm các thuộc tính chiến đấu. Thần Thông thường rất mạnh, hiếm có, hồi chiêu dài.
            - Ví dụ: \\\`[SKILL_LEARNED: name="Thiên Lý Nhãn", description="Tăng cường thị lực, nhìn xa vạn dặm.", skillType="${GameTemplates.SkillType.THAN_THONG}", manaCost=50, cooldown=10, otherEffects="Phát hiện kẻ địch ẩn thân trong phạm vi 1km"]\`\\\`
        - **Nếu \`skillType="${GameTemplates.SkillType.CAM_THUAT}"\`:**
            - Cần thêm: \`sideEffects="Mô tả tác dụng phụ, ví dụ: giảm 20% sinh lực tối đa vĩnh viễn..."\`.
            - Thêm các thuộc tính chiến đấu. Cấm Thuật phải có cái giá rất đắt.
            - Ví dụ: \\\`[SKILL_LEARNED: name="Huyết Tế Đại Pháp", description="Hi sinh máu tươi để nhận sức mạnh.", skillType="${GameTemplates.SkillType.CAM_THUAT}", sideEffects="Mất 20% sinh lực tối đa vĩnh viễn sau mỗi lần sử dụng.", manaCost=0, cooldown=100, otherEffects="Tăng 100% Sức Tấn Công trong 5 lượt"]\`\\\`
        - **Nếu \`skillType="${GameTemplates.SkillType.NGHE_NGHIEP}"\`:**
            - Cần thêm: \`professionType="(${Object.values(GameTemplates.ProfessionType).join('|')})"\`, \`skillDescription="Mô tả kỹ năng nghề đó làm được gì cụ thể."\`, \`professionGrade="(${GameTemplates.PROFESSION_GRADES.join('|')})"\`.
            - Ví dụ: \\\`[SKILL_LEARNED: name="Sơ Cấp Luyện Đan", description="Kiến thức cơ bản về luyện đan.", skillType="${GameTemplates.SkillType.NGHE_NGHIEP}", professionType="Luyện Đan Sư", skillDescription="Có thể luyện chế các loại đan dược phẩm cấp thấp.", professionGrade="Nhất phẩm"]\`\\\`
        - **Thuộc tính chiến đấu chung (cho Linh Kĩ, Thần Thông, Cấm Thuật):** \`manaCost=SỐ\`, \`cooldown=SỐ\`, \`baseDamage=SỐ\`, \`baseHealing=SỐ\`, \`damageMultiplier=SỐ_THẬP_PHÂN\`, \`healingMultiplier=SỐ_THẬP_PHÂN\`, \`otherEffects="Hiệu ứng 1;Hiệu ứng 2"\`.
        - **Lưu ý:** Thuộc tính \`effect\` cũ giờ được thay thế bằng \`otherEffects\` và các thuộc tính chi tiết hơn.
    *   **NPC:** Sử dụng tag \\\`[NPC: name="Tên NPC", gender="Nam/Nữ/Khác/Không rõ", race="Chủng tộc (ví dụ: Nhân Tộc, Yêu Tộc)", description="Mô tả chi tiết", personality="Tính cách", affinity=Số, factionId="ID Phe (nếu có)", realm="Cảnh giới NPC (nếu có)", tuChat="CHỌN MỘT TRONG: ${TU_CHAT_TIERS.join(' | ')}" (TÙY CHỌN, nếu NPC có tu luyện), relationshipToPlayer="Mối quan hệ", spiritualRoot="Linh căn của NPC (nếu có)", specialPhysique="Thể chất của NPC (nếu có)", statsJSON='{"thoNguyen": X, "maxThoNguyen": Y}']\`\\\`.
        ${worldConfig.startingNPCs && worldConfig.startingNPCs.map(npc => `[NPC: name="${npc.name.replace(/"/g, '\\"')}", gender="${npc.gender || 'Không rõ'}", race="${npc.race || 'Nhân Tộc'}", description="Chi tiết: ${npc.details.replace(/"/g, '\\"')}", personality="${npc.personality.replace(/"/g, '\\"')}", affinity=${npc.initialAffinity}${isCultivationEnabled && npc.realm ? `, realm="${npc.realm}"` : ''}${isCultivationEnabled && npc.tuChat ? `, tuChat="${npc.tuChat}"` : ''}${npc.relationshipToPlayer ? `, relationshipToPlayer="${npc.relationshipToPlayer.replace(/"/g, '\\"')}"` : ''}${isCultivationEnabled && npc.spiritualRoot ? `, spiritualRoot="${npc.spiritualRoot}"` : ''}${isCultivationEnabled && npc.specialPhysique ? `, specialPhysique="${npc.specialPhysique}"` : ''}${isCultivationEnabled && npc.thoNguyen && npc.maxThoNguyen ? `, statsJSON='{"thoNguyen":${npc.thoNguyen}, "maxThoNguyen":${npc.maxThoNguyen}}'` : ''}]`).join('\n')}
    *   **Yêu Thú:** Sử dụng tag \\\`[YEUTHU: name="Tên", species="Loài", description="Mô tả", isHostile=true/false, realm="Cảnh giới (nếu có)"]\`\\\`.
        ${worldConfig.startingYeuThu && worldConfig.startingYeuThu.map(yt => `[YEUTHU: name="${yt.name.replace(/"/g, '\\"')}", species="${yt.species.replace(/"/g, '\\"')}", description="${yt.description.replace(/"/g, '\\"')}", isHostile=${yt.isHostile}${yt.realm ? `, realm="${yt.realm}"` : ''}]`).join('\n')}
    *   **Địa Điểm Chính (Top-level):** Sử dụng tag \\\`[MAINLOCATION: name="Tên Địa Điểm", description="Mô tả chi tiết về địa điểm.", locationType="CHỌN MỘT TRONG: ${Object.values(GameTemplates.LocationType).join(' | ')}", isSafeZone=true/false, regionId="ID Vùng (nếu có)", mapX=X (số, 0-1000, tùy chọn), mapY=Y (số, 0-1000, tùy chọn)]\`\\\`. **CẤM SỬ DỤNG TAG** \\\`[SUBLOCATION]\`\\\` **TRONG PHẢN HỒI NÀY.**
        ${worldConfig.startingLocations && worldConfig.startingLocations.map(loc => `[MAINLOCATION: name="${loc.name.replace(/"/g, '\\"')}", description="${loc.description.replace(/"/g, '\\"')}", locationType="${loc.locationType || GameTemplates.LocationType.DEFAULT}", isSafeZone=${loc.isSafeZone || false}${loc.regionId ? `, regionId="${loc.regionId.replace(/"/g, '\\"')}"` : ''}${loc.mapX !== undefined ? `, mapX=${loc.mapX}`:''}${loc.mapY !== undefined ? `, mapY=${loc.mapY}`:''}]`).join('\n')}
    *   **Phe phái:** Nếu có phe phái khởi đầu, sử dụng tag \\\`[FACTION_DISCOVERED: name="Tên Phe Phái", description="Mô tả", alignment="Chính Nghĩa/Trung Lập/Tà Ác/Hỗn Loạn", playerReputation=Số]\\\`.
        ${worldConfig.startingFactions && worldConfig.startingFactions.map(fac => `[FACTION_DISCOVERED: name="${fac.name.replace(/"/g, '\\"')}", description="${fac.description.replace(/"/g, '\\"')}", alignment="${fac.alignment}", playerReputation=${fac.initialPlayerReputation}]`).join('\n')}
    *   **Tri Thức Thế Giới:** Sử dụng tag \\\`[WORLD_LORE_ADD: title="Tiêu đề Lore",content="Nội dung chi tiết của Lore"]\`\\\`.
        ${worldConfig.startingLore && worldConfig.startingLore.map(lore => `[WORLD_LORE_ADD: title="${lore.title.replace(/"/g, '\\"')}",content="${lore.content.replace(/"/g, '\\"')}"]`).join('\n')}
    LƯU Ý: Với kỹ năng, \\\`effect\\\` phải mô tả rõ hiệu ứng để game xử lý. Với NPC, \\\`description\\\` nên bao gồm thông tin về tính cách, vai trò. \\\`affinity\\\` là một số từ -100 đến 100.
    **QUAN TRỌNG:** Bất cứ khi nào nhân vật học được một kỹ năng mới, BẮT BUỘC phải sử dụng tag \\\`[SKILL_LEARNED]\`\\\` với đầy đủ thông tin nhất có thể.

**QUY TẮC SỬ DỤNG TAG (CHUNG CHO MỌI LƯỢT KỂ TIẾP THEO, BAO GỒM CẢ LƯỢT ĐẦU TIÊN NÀY SAU KHI KHỞI TẠO):**
**0. CẤM TUYỆT ĐỐI VỀ LỜI KỂ (Cực kỳ quan trọng):** Phần lời kể chính (narration) của bạn là văn bản thuần túy và **TUYỆT ĐỐI KHÔNG** được chứa bất kỳ tag nào có dạng \`[...]\`. Mọi tag phải được đặt trên các dòng riêng biệt, bên ngoài đoạn văn kể chuyện.
**1.  Đánh Dấu Hội Thoại/Âm Thanh (QUAN TRỌNG):** Khi nhân vật nói chuyện, rên rỉ khi làm tình, hoặc kêu la khi chiến đấu, hãy đặt toàn bộ câu nói/âm thanh đó vào giữa hai dấu ngoặc kép và dấu '${DIALOGUE_MARKER}', hãy cho nhân vật và npc nói chuyện ở múc độ vừa phải ở những cuộc hội thoại bình thường và chiến đấu nhưng khi quan hệ tình dục thì hãy chèn thêm nhiều câu rên rỉ và những lời tục tĩu tăng tình thú giữa các hành động.
    *   Ví dụ lời nói: AI kể: Hắn nhìn cô và nói ${DIALOGUE_MARKER}Em có khỏe không?${DIALOGUE_MARKER}.
    *   Ví dụ tiếng rên: AI kể: Cô ấy khẽ rên ${DIALOGUE_MARKER}Ah...~${DIALOGUE_MARKER} khi bị chạm vào.
    *   Ví dụ tiếng hét chiến đấu: AI kể: Tiếng hét ${DIALOGUE_MARKER}Xung phong!${DIALOGUE_MARKER} vang vọng chiến trường.
**2.  Tag \\\`[STATS_UPDATE: TênChỉSố=GiáTrịHoặcThayĐổi, ...]\`\\\`:** Dùng để cập nhật chỉ số của người chơi.
    *   **Tham số TênChỉSố:** \`sinhLuc\`, \`linhLuc\` (nếu có tu luyện), \`kinhNghiem\` (nếu có tu luyện/cấp độ), \`currency\`, \`isInCombat\`, \`turn\`. Tên chỉ số NÊN viết thường.
    *   **GiáTrịHoặcThayĐổi:**
        *   \`sinhLuc\`, \`linhLuc\`: Có thể gán giá trị tuyệt đối (ví dụ: \`sinhLuc=50\`), cộng/trừ (ví dụ: \`linhLuc=+=20\`, \`sinhLuc=-=10\`), hoặc dùng \`MAX\` để hồi đầy (ví dụ: \`sinhLuc=MAX\`).
        *   \`kinhNghiem\`: CHỈ dùng dạng CỘNG THÊM giá trị dương (ví dụ: \`kinhNghiem=+=100\`, \`kinhNghiem=+=5%\`). KHÔNG dùng giá trị tuyệt đối hay âm.
        *   \`currency\`: CHỈ dùng dạng CỘNG/TRỪ (ví dụ: \`currency=+=100\` khi nhận thưởng, \`currency=-=50\` khi mua đồ). KHÔNG dùng giá trị tuyệt đối.
        *   \`isInCombat\`: \`true\` hoặc \`false\`.
        *   \`turn\`: CHỈ dùng \`turn=+1\` ở CUỐI MỖI LƯỢT PHẢN HỒI CỦA BẠN.
    *   **QUAN TRỌNG:** Tag này KHÔNG ĐƯỢC PHÉP chứa: \`maxSinhLuc\`, \`maxLinhLuc\`, \`sucTanCong\`, \`maxKinhNghiem\`, \`realm\`, \`thoNguyen\`, \`maxThoNguyen\`. Hệ thống game sẽ tự quản lý các chỉ số này.
    *   **VÍ DỤ (Allowed):**
        *   \\\`[STATS_UPDATE: kinhNghiem=+=50, sinhLuc=-=10, currency=+=20]\`
        *   \\\`[STATS_UPDATE: linhLuc=MAX, kinhNghiem=+=5%]\\\`
    *   **VÍ DỤ (Not Allowed):**
        *   \\\`[STATS_UPDATE: currency=500]\`\\\` (Lý do: \`currency\` phải là dạng cộng thêm \`+=X\` hoặc trừ \`-=X\`)
        *   \\\`[STATS_UPDATE: maxSinhLuc=+=100]\`\\\` (Lý do: \`maxSinhLuc\` do hệ thống quản lý)
        *   \\\`[STATS_UPDATE: realm="Trúc Cơ Kỳ"]\`\\\` (Lý do: \`realm\` thay đổi qua sự kiện đột phá, không phải qua tag này)

**3.  Tag \\\`[ITEM_ACQUIRED: ...]\`\\\`:** Dùng khi người chơi nhận được vật phẩm mới.
    *   **CẤM TUYỆT ĐỐI VỀ VẬT PHẨM TIỀN TỆ:** Đơn vị tiền tệ của thế giới là "${worldConfig.currencyName}". Bạn **TUYỆT ĐỐI KHÔNG** được tạo ra bất kỳ vật phẩm nào có chức năng tương tự tiền tệ (ví dụ: "Linh Thạch Hạ Phẩm", "Túi Vàng", "Ngân Phiếu") bằng tag \`[ITEM_ACQUIRED]\`. Việc này sẽ phá vỡ hệ thống kinh tế của game.
    *   **Tham số bắt buộc:** \`name\`, \`type\`, \`description\`, \`quantity\`, \`rarity\`, \`itemRealm\`.
    *   \`type\`: Phải bao gồm **Loại Chính** và **Loại Phụ** (nếu có).
        *   **Loại Chính Hợp Lệ:** ${Object.values(GameTemplates.ItemCategory).join(' | ')}.
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.EQUIPMENT}\`, Loại Phụ (\`equipmentType\`) PHẢI là một trong: ${Object.values(GameTemplates.EquipmentType).join(' | ')}.
            *   Ví dụ: \`type="${GameTemplates.ItemCategory.EQUIPMENT} ${GameTemplates.EquipmentType.VU_KHI}"\`.
            *   **Tham số RIÊNG \`equipmentType\` cũng BẮT BUỘC** (ví dụ: \`equipmentType="${GameTemplates.EquipmentType.VU_KHI}"\`).
            *   **Tham số RIÊNG \`statBonusesJSON\` BẮT BUỘC** (ví dụ: \`statBonusesJSON='{"sucTanCong": 10}'\`. Nếu không có, dùng \`statBonusesJSON='{}'\`). JSON phải hợp lệ. Các khóa trong JSON có thể là: \`maxSinhLuc\`, \`maxLinhLuc\`, \`sucTanCong\`.
            *   **Tham số RIÊNG \`uniqueEffectsList\` BẮT BUỘC** (ví dụ: \`uniqueEffectsList="Hút máu 5%;Tăng tốc"\`. Nếu không có, dùng \`uniqueEffectsList="Không có gì đặc biệt"\`). Các hiệu ứng cách nhau bởi dấu ';'.
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.POTION}\`, Loại Phụ (\`potionType\`) PHẢI là một trong: ${Object.values(GameTemplates.PotionType).join(' | ')}.
            *   Ví dụ: \`type="${GameTemplates.ItemCategory.POTION} ${GameTemplates.PotionType.HOI_PHUC}"\`.
            *   **Tham số RIÊNG \`potionType\` cũng BẮT BUỘC** (ví dụ: \`potionType="${GameTemplates.PotionType.HOI_PHUC}"\`).
            *   **Tham số RIÊNG \`effectsList\` BẮT BUỘC** (ví dụ: \`effectsList="Hồi 100 HP;Tăng 20 ATK trong 3 lượt"\`. Nếu không có, dùng \`effectsList="Không có gì đặc biệt"\`). Các hiệu ứng cách nhau bởi dấu ';'.
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.MATERIAL}\`, Loại Phụ (\`materialType\`) PHẢI là một trong: ${Object.values(GameTemplates.MaterialType).join(' | ')}.
            *   Ví dụ: \`type="${GameTemplates.ItemCategory.MATERIAL} ${GameTemplates.MaterialType.LINH_THAO}"\`.
            *   **Tham số RIÊNG \`materialType\` cũng BẮT BUỘC** (ví dụ: \`materialType="${GameTemplates.MaterialType.LINH_THAO}"\`).
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.CONG_PHAP}\`, thêm các tham số bắt buộc \`congPhapType="(${Object.values(GameTemplates.CongPhapType).join('|')})"\` và \`expBonusPercentage=SỐ\`.
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.LINH_KI}\`, thêm tham số bắt buộc \`skillToLearnJSON='{...}'\` (một chuỗi JSON hợp lệ mô tả kỹ năng).
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.PROFESSION_SKILL_BOOK}\`, thêm tham số bắt buộc \`professionToLearn="(${Object.values(GameTemplates.ProfessionType).join('|')})"\`.
        *   Nếu Loại Chính là \`${GameTemplates.ItemCategory.PROFESSION_TOOL}\`, thêm tham số bắt buộc \`professionRequired="(${Object.values(GameTemplates.ProfessionType).join('|')})"\`.
        *   Đối với \`${GameTemplates.ItemCategory.QUEST_ITEM}\` và \`${GameTemplates.ItemCategory.MISCELLANEOUS}\`, không cần Loại Phụ trong \`type\`.
    *   **\`itemRealm\`: BẮT BUỘC. Cảnh giới của vật phẩm. PHẢI là một trong các cảnh giới lớn của thế giới: \`${mainRealms.join(' | ')}\`.**
    *   **Tham số tùy chọn:** \`value\` (số nguyên), \`slot\` (cho trang bị, ví dụ: "Vũ Khí Chính"), \`durationTurns\`, \`cooldownTurns\` (cho đan dược), \`questIdAssociated\` (cho vật phẩm nhiệm vụ), \`usable\`, \`consumable\` (cho vật phẩm linh tinh).
    *   **VÍ DỤ (Allowed - Trang Bị):** \\\`[ITEM_ACQUIRED: name="Huyết Long Giáp", type="${GameTemplates.ItemCategory.EQUIPMENT} ${GameTemplates.EquipmentType.GIAP_THAN}", equipmentType="${GameTemplates.EquipmentType.GIAP_THAN}", description="Giáp làm từ vảy Huyết Long, tăng cường sinh lực.", quantity=1, rarity="${GameTemplates.ItemRarity.CUC_PHAM}", value=1000, itemRealm="Hóa Thần", statBonusesJSON='{"maxSinhLuc": 200}', uniqueEffectsList="Phản sát thương 10%;Kháng Hỏa +30", slot="Giáp Thân"]\`
    *   **VÍ DỤ (Allowed - Đan Dược):** \\\`[ITEM_ACQUIRED: name="Cửu Chuyển Hồi Hồn Đan", type="${GameTemplates.ItemCategory.POTION} ${GameTemplates.PotionType.HOI_PHUC}", potionType="${GameTemplates.PotionType.HOI_PHUC}", description="Đan dược thượng phẩm, hồi phục sinh lực lớn.", quantity=3, rarity="${GameTemplates.ItemRarity.QUY_BAU}", value=500, itemRealm="Nguyên Anh", effectsList="Hồi 500 HP;Giải trừ mọi hiệu ứng bất lợi nhẹ"]\`
    *   **VÍ DỤ (Not Allowed - Trang Bị):** \\\`[ITEM_ACQUIRED: name="Kiếm Gỗ", type="Vũ Khí", description="Một thanh kiếm gỗ thường.", statBonusesJSON="tăng 5 công"]\`\\\` (Lý do: \`type\` thiếu Loại Chính; \`statBonusesJSON\` không phải JSON hợp lệ; thiếu \`equipmentType\`, \`uniqueEffectsList\`, \`itemRealm\`)

**4.  Tag \\\`[ITEM_CONSUMED: name="Tên",quantity=SốLượng]\`\\\`:** Dùng khi vật phẩm bị tiêu hao.
    *   **Tham số bắt buộc:** \`name\` (khớp với tên vật phẩm trong túi đồ), \`quantity\` (số lượng tiêu hao).

**5.  Tag \\\`[ITEM_UPDATE: name="Tên Vật Phẩm Trong Túi", field="TênTrường", newValue="GiáTrịMới" hoặc change=+-GiáTrị]\`\\\`:** Dùng để cập nhật một thuộc tính của vật phẩm hiện có.
    *   **VÍ DỤ:** \\\`[ITEM_UPDATE: name="Rỉ Sét Trường Kiếm", field="description", newValue="Trường kiếm đã được mài sắc và phục hồi phần nào sức mạnh."]\`\\\`

**6.  Tag \\\`[SKILL_LEARNED: ...]\`\\\`:** Dùng khi nhân vật học được kỹ năng mới.
    *   **Thuộc tính chung (BẮT BUỘC cho mọi loại):** \`name\`, \`description\`, \`skillType="CHỌN MỘT TRONG: ${Object.values(GameTemplates.SkillType).join(' | ')}"\`, \`otherEffects= hiệu ứng đặc biệt của kĩ năng, bắt buộc phải có\`.
    *   **Nếu \`skillType="${GameTemplates.SkillType.CONG_PHAP_TU_LUYEN}"\`:**
        - Cần thêm: \`congPhapType="(${Object.values(GameTemplates.CongPhapType).join('|')})"\`, \`congPhapGrade="(${GameTemplates.CONG_PHAP_GRADES.join('|')})"\`.
        - Nếu \`congPhapType="${GameTemplates.CongPhapType.VO_Y}"\`, thêm \`weaponFocus="(${WEAPON_TYPES_FOR_VO_Y.join('|')})"\`.
    *   **Nếu \`skillType="${GameTemplates.SkillType.LINH_KI}"\`:**
        - Cần thêm: \`linhKiCategory="(${GameTemplates.LINH_KI_CATEGORIES.join('|')})"\`, \`linhKiActivation="(${GameTemplates.LINH_KI_ACTIVATION_TYPES.join('|')})"\`.
        - Nếu \`linhKiActivation="Chủ động"\`, thêm các thuộc tính chiến đấu chung. Nếu \`linhKiCategory="Tấn công"\`, thêm \`baseDamage\`, \`damageMultiplier\`. Nếu \`linhKiCategory="Hồi phục"\`, thêm \`baseHealing\`, \`healingMultiplier\`.
    *   **Nếu \`skillType="${GameTemplates.SkillType.THAN_THONG}"\`:** Thêm các thuộc tính chiến đấu chung.
    *   **Nếu \`skillType="${GameTemplates.SkillType.CAM_THUAT}"\`:**
        - Cần thêm: \`sideEffects="Mô tả tác dụng phụ..."\`. Thêm các thuộc tính chiến đấu chung.
    *   **Nếu \`skillType="${GameTemplates.SkillType.NGHE_NGHIEP}"\`:**
        - Cần thêm: \`professionType="(${Object.values(GameTemplates.ProfessionType).join('|')})"\`, \`skillDescription="Mô tả kỹ năng nghề..."\`, \`professionGrade="(${GameTemplates.PROFESSION_GRADES.join('|')})"\`.
    *   **Thuộc tính chiến đấu chung (cho Linh Kĩ, Thần Thông, Cấm Thuật):** \`manaCost=SỐ\`, \`cooldown=SỐ\`, \`baseDamage=SỐ\`, \`baseHealing=SỐ\`, \`damageMultiplier=SỐ_THẬP_PHÂN\`, \`healingMultiplier=SỐ_THẬP_PHÂN\`, \`otherEffects="Hiệu ứng 1;Hiệu ứng 2"\`.
    
    *Ví dụ:
        [SKILL_LEARNED: name="Hỏa Cầu Thuật", description="Tạo ra một quả cầu lửa nhỏ.", skillType="${GameTemplates.SkillType.LINH_KI}", linhKiCategory="Tấn công", linhKiActivation="Chủ động", manaCost=10, cooldown=1, baseDamage=20, otherEffects="Gây hiệu ứng Bỏng trong 2 lượt"]
        [SKILL_LEARNED: name="Thiên Lý Nhãn", description="Tăng cường thị lực, nhìn xa vạn dặm.", skillType="${GameTemplates.SkillType.THAN_THONG}", manaCost=50, cooldown=10, otherEffects="Phát hiện kẻ địch ẩn thân trong phạm vi 1km"]
        [SKILL_LEARNED: name="Huyết Tế Đại Pháp", description="Hi sinh máu tươi để nhận sức mạnh.", skillType="${GameTemplates.SkillType.CAM_THUAT}", sideEffects="Mất 20% sinh lực tối đa vĩnh viễn sau mỗi lần sử dụng.", manaCost=0, cooldown=100, otherEffects="Tăng 100% Sức Tấn Công trong 5 lượt"]
        [SKILL_LEARNED: name="Kim Cang Quyết", description="Một công pháp luyện thể sơ cấp.", skillType="${GameTemplates.SkillType.CONG_PHAP_TU_LUYEN}", congPhapType="Thể Tu", congPhapGrade="Hoàng Phẩm"]

**7.  Tags Nhiệm Vụ (\`QUEST_*\`):**
    *   \`[QUEST_ASSIGNED: title="Tên NV",description="Mô tả chi tiết NV",objectives="Mục tiêu 1|Mục tiêu 2|..."]\` (Dấu '|' phân cách các mục tiêu) (Bắt buộc phải có đầy đủ thuộc tính)
    *   \`[QUEST_UPDATED: title="Tên NV đang làm", objectiveText="Văn bản GỐC của mục tiêu cần cập nhật (PHẢI KHỚP CHÍNH XÁC TOÀN BỘ, BAO GỒM CẢ SỐ LƯỢNG HIỆN TẠI nếu có, ví dụ: 'Săn lợn rừng (0/3)')", newObjectiveText="Văn bản MỚI của mục tiêu (TÙY CHỌN - nếu có thay đổi về mô tả hoặc số lượng, ví dụ: 'Săn lợn rừng (1/3)')", completed=true/false]\`\\\`
        *   **QUAN TRỌNG VỀ ĐỊNH DẠNG TRẢ VỀ TAG NÀY:** CHỈ trả về duy nhất tag \`[QUEST_UPDATED: ...]\`. KHÔNG thêm bất kỳ văn bản mô tả nào về nhiệm vụ (ví dụ: "Nhiệm vụ: [Tên nhiệm vụ]") ngay trước hoặc sau tag. KHÔNG trả về khối JSON mô tả đối tượng nhiệm vụ. Mọi thông tin cho người chơi biết về cập nhật nhiệm vụ PHẢI được đưa vào phần lời kể (narration) một cách tự nhiên.
        *   **QUAN TRỌNG VỚI MỤC TIÊU CÓ SỐ LƯỢNG (VD: 0/3):**
            *   \`objectiveText\`: PHẢI là văn bản hiện tại, ví dụ: "Thu thập Linh Tâm Thảo (0/3)".
            *   \`newObjectiveText\`: Nên cập nhật số lượng, ví dụ: "Thu thập Linh Tâm Thảo (1/3)". Nếu không cung cấp, hệ thống game có thể không hiển thị đúng tiến độ dạng chữ.
            *   \`completed\`: Đặt là \`true\` CHỈ KHI mục tiêu đã hoàn thành ĐẦY ĐỦ (ví dụ: "Thu thập Linh Tâm Thảo (3/3)"). Nếu chỉ tăng số lượng nhưng chưa đủ (ví dụ: (1/3), (2/3)), thì đặt \`completed=false\`.
        *   **VÍ DỤ (Cập nhật tiến độ):** Giả sử mục tiêu hiện tại là "Săn 3 Lợn Rừng (0/3)". Người chơi săn được 1 con. AI nên trả về:
            \\\`[QUEST_UPDATED: title="Săn Lợn Rừng", objectiveText="Săn 3 Lợn Rừng (0/3)", newObjectiveText="Săn 3 Lợn Rừng (1/3)", completed=false]\`\\\`
        *   **VÍ DỤ (Hoàn thành mục tiêu có số lượng):** Giả sử mục tiêu hiện tại là "Săn 3 Lợn Rừng (2/3)". Người chơi săn được con cuối cùng. AI nên trả về:
            \\\`[QUEST_UPDATED: title="Săn Lợn Rừng", objectiveText="Săn 3 Lợn Rừng (2/3)", newObjectiveText="Săn 3 Lợn Rừng (3/3)", completed=true]\`\\\`
        *   **VÍ DỤ (Cập nhật mục tiêu không có số lượng):**
            \\\`[QUEST_UPDATED: title="Tìm Kiếm Manh Mối", objectiveText="Hỏi thăm dân làng về tên trộm.", newObjectiveText="Đã hỏi thăm một vài người, có vẻ tên trộm chạy về hướng Tây.", completed=false]\`\\\`
    *   \`[QUEST_COMPLETED: title="Tên NV đã hoàn thành toàn bộ"]\`\\\`
    *   \`[QUEST_FAILED: title="Tên NV đã thất bại"]\`\\\`

**8.  Tags Thêm Mới Thông Tin Thế Giới (\`NPC\`, \`YEUTHU\`, \`MAINLOCATION\`, \`FACTION_DISCOVERED\`, \`WORLD_LORE_ADD\`):**
    *   \`[NPC: name="Tên NPC", ...]\`: Tạo NPC mới. (Xem hướng dẫn chi tiết bên trên)
    *   \`[YEUTHU: name="Tên Yêu Thú", species="Loài", ...]\`: Tạo Yêu Thú mới.
    *   \`[MAINLOCATION: name="Tên Địa Điểm", ...]\`: Tạo địa điểm chính mới. (Xem hướng dẫn chi tiết bên trên)
    *   \`[FACTION_DISCOVERED: name="Tên Phe Phái", ...]\`: Khám phá phe phái mới.
    *   \`[WORLD_LORE_ADD: title="Tiêu đề", ...]\`: Thêm tri thức mới.
    
**9.  Tags Cập Nhật Thông Tin Thế Giới Hiện Có (\`NPC_UPDATE\`, \`WIFE_UPDATE\`, \`SLAVE_UPDATE\`, \`PRISONER_UPDATE\`, \`LOCATION_*\`, \`FACTION_UPDATE\`, \`WORLD_LORE_UPDATE\`):** Tên/Tiêu đề phải khớp chính xác với thực thể cần cập nhật.
    *   **QUAN TRỌNG VỀ CẬP NHẬT NHÂN VẬT:** Bạn PHẢI sử dụng tag chính xác dựa trên loại nhân vật. Trong các lượt chơi sau, hãy kiểm tra các danh sách \`Đạo Lữ\`, \`Nô Lệ\`, \`Tù Nhân\`, và \`NPC\` để xác định loại nhân vật trước khi tạo tag.
        *   **Với NPC thông thường:** Dùng \`[NPC_UPDATE: name="Tên NPC Hiện Tại", newName="Tên Mới (Tùy chọn)", race="Chủng tộc mới", affinity="=+X hoặc -=Y", description="Mô tả mới", realm="Cảnh giới mới", tuChat="Tư chất mới (TÙY CHỌN)", relationshipToPlayer="Mối quan hệ mới", statsJSON='{...}', ...]\`. Nên thường xuyên thay đổi \`relationshipToPlayer\` theo đúng với diễn biến và độ thiện cảm.
        *   **Với Đạo Lữ (Vợ):** Dùng \`[WIFE_UPDATE: name="Tên Đạo Lữ", affinity="+=X", willpower="+=X", obedience="+=X", ...]\`.
        *   **Với Nô Lệ:** Dùng \`[SLAVE_UPDATE: name="Tên Nô Lệ", affinity="+=X", willpower="+=X", obedience="+=X", ...]\`.
        *   **Với Tù Nhân:** Dùng \`[PRISONER_UPDATE: name="Tên Tù Nhân", affinity="+=X", willpower="-=X", resistance="-=X", obedience="+=X", ...]\`.
    *   \`[LOCATION_UPDATE: name="Tên Địa Điểm Hiện Tại", newName="Tên Mới (Tùy chọn)", description="Mô tả mới", isSafeZone=true/false, mapX=X, mapY=Y, locationType="CHỌN MỘT TRONG: ${Object.values(GameTemplates.LocationType).join(' | ')}", ...]\`\\\`
        *   **VÍ DỤ:** \\\`[LOCATION_UPDATE: name="Rừng Cổ Thụ", description="Khu rừng giờ đây âm u hơn.", locationType="${GameTemplates.LocationType.FOREST}", mapX=150, mapY=220]\`\\\`
    *   \`[LOCATION_CHANGE: name="Tên Địa Điểm Mới"]\`: Dùng để di chuyển người chơi đến một địa điểm đã biết. Hệ thống sẽ tự động cập nhật vị trí hiện tại của người chơi.
    *   \\\`[FACTION_UPDATE: name="Tên Phe Phái Hiện Tại", newName="Tên Mới (Tùy chọn)", description="Mô tả mới", alignment="Chính/Tà...", playerReputation="=X hoặc +=X hoặc -=X"]\`\\\`
        *   **Tham số \`playerReputation\`:** Có thể là \`playerReputation="=50"\` (đặt thành 50), \`playerReputation="+=10"\` (tăng 10), \`playerReputation="-=5"\` (giảm 5).
        *   **VÍ DỤ:** \\\`[FACTION_UPDATE: name="Thanh Vân Môn", playerReputation="+=10", description="Môn phái ngày càng nổi tiếng nhờ sự đóng góp của bạn."]\`\\\`
    *   \`[WORLD_LORE_UPDATE: title="Tiêu Đề Lore Hiện Tại", newTitle="Tiêu Đề Mới (Tùy chọn)", content="Nội dung lore mới."]\`\\\`
        *   **VÍ DỤ:** \\\`[WORLD_LORE_UPDATE: title="Nguồn Gốc Ma Tộc", content="Ma Tộc thực ra là một nhánh của Yêu Tộc cổ đại bị tha hóa."]\`\\\`

**10. Tag Xóa Thông Tin Thế Giới (\`FACTION_REMOVE\`):**
    *   \\\`[FACTION_REMOVE: name="Tên Phe Phái Cần Xóa"]\`\\\`
        *   **VÍ DỤ:** \\\`[FACTION_REMOVE: name="Hắc Phong Trại"]\`\\\`
        *   **Lưu ý:** Hành động này không thể hoàn tác trong game.

**11. Tag \\\`[MESSAGE: "Thông báo tùy chỉnh cho người chơi"]\`\\\`:** Dùng cho các thông báo hệ thống đặc biệt. **KHÔNG dùng để thông báo về việc lên cấp/đột phá cảnh giới.**
**12. Tag \\\`[SET_COMBAT_STATUS: true/false]\`\\\`:** Bắt đầu hoặc kết thúc trạng thái chiến đấu.
**13. Tags Đồng Hành (\`COMPANION_*\`):**
    *   \`[COMPANION_JOIN: name="Tên",description="Mô tả",hp=X,maxHp=X,mana=Y,maxMana=Y,atk=Z, realm="Cảnh giới (nếu có)"]\`\\\`
    *   \`[COMPANION_LEAVE: name="Tên"]\`\\\`
    *   \`[COMPANION_STATS_UPDATE: name="Tên",hp=ThayĐổi,mana=ThayĐổi,atk=ThayĐổi]\`\\\`
**14. Tags Hiệu Ứng Trạng Thái (\`STATUS_EFFECT_*\`):**
    *   \`[STATUS_EFFECT_APPLY: name="Tên Hiệu Ứng", description="Mô tả hiệu ứng", type="buff|debuff|neutral", durationTurns=X (0 là vĩnh viễn/cho đến khi gỡ bỏ), statModifiers='{"statName1": value1, "statName2": "±Y%"}', specialEffects="Hiệu ứng đặc biệt 1;Hiệu ứng đặc biệt 2"]\`\\\`
        *   \`statModifiers\`: JSON string. Keys là tên chỉ số (ví dụ: \`sucTanCong\`, \`maxSinhLuc\`). Values có thể là số cho thay đổi tuyệt đối hoặc chuỗi như \`"+10%"\` hoặc \`"-5"\`.
        *   \`specialEffects\`: Chuỗi các hiệu ứng đặc biệt, cách nhau bởi dấu chấm phẩy (';'). Ví dụ: "Không thể hành động;Tăng 10% tỉ lệ chí mạng".
        *   Ví dụ: \\\`[STATUS_EFFECT_APPLY: name="Trúng Độc", description="Mất máu từ từ.", type="debuff", durationTurns=5, statModifiers='{"sinhLuc": "-5"}', specialEffects="Mỗi lượt mất 5 Sinh Lực"]\`\\\`
    *   \`[STATUS_EFFECT_REMOVE: name="Tên Hiệu Ứng Cần Gỡ Bỏ"]\`\\\`
    *   **LƯU Ý QUAN TRỌNG KHI SỬ DỤNG VẬT PHẨM (VÍ DỤ: ĐAN DƯỢC):**
        Khi một vật phẩm (ví dụ: đan dược như "Bình Khí Huyết") được sử dụng và mang lại các hiệu ứng TẠM THỜI (tăng chỉ số, hiệu ứng đặc biệt), bạn PHẢI sử dụng tag \\\`[STATUS_EFFECT_APPLY: ...]\`\\\` để biểu thị các hiệu ứng này, thay vì dùng \\\`[STATS_UPDATE: ...]\`\\\` cho các chỉ số bị ảnh hưởng tạm thời.
        *   **Thứ tự:** Luôn đặt tag \`[ITEM_CONSUMED: ...]\` TRƯỚC tag \`[STATUS_EFFECT_APPLY: ...]\`.
        *   **Ví dụ:** Nếu vật phẩm "Bình Khí Huyết" (mô tả: "Một loại dược dịch có tác dụng bồi bổ khí huyết, tăng cường sinh lực. Uống vào sẽ cảm thấy cơ thể nóng rực, dục hỏa bừng bừng." và có tác dụng: "Tăng cường 20 sức tấn công, 30 sinh lực tối đa trong 30 phút. Tăng 10 điểm mị lực, 10 điểm dục vọng.") được sử dụng, bạn NÊN trả về:
            \`[ITEM_CONSUMED: name="Bình Khí Huyết", quantity=1]\`
            \`[STATUS_EFFECT_APPLY: name="Khí Huyết Sôi Trào", description="Cơ thể nóng rực, khí huyết cuộn trào, tăng cường sức mạnh và dục vọng.", type="buff", durationTurns=30, statModifiers='{"sucTanCong": 20, "maxSinhLuc": 30}', specialEffects="Tăng 10 điểm mị lực;Tăng 10 điểm dục vọng;Dục hỏa bùng cháy dữ dội"]\`
        *   Các thay đổi vĩnh viễn hoặc hồi phục trực tiếp (ví dụ: hồi máu từ đan dược hồi phục không tăng maxSinhLuc) vẫn có thể dùng \`[STATS_UPDATE: sinhLuc=+X]\`\\\`.
        *   Nếu vật phẩm có cả hiệu ứng hồi phục tức thời VÀ hiệu ứng buff tạm thời, hãy dùng CẢ HAI tag: \`[STATS_UPDATE: sinhLuc=+=Y]\`\\\` cho phần hồi phục và \\\`[STATUS_EFFECT_APPLY: ...]\`\\\` cho phần buff.
        *   Đối với các chỉ số không có trong hệ thống người chơi (ví dụ: "mị lực", "dục vọng" từ ví dụ trên), hãy mô tả chúng trong thuộc tính \`specialEffects\` của tag \\\`STATUS_EFFECT_APPLY\\\`.

**15. Tag \\\`[REMOVE_BINH_CANH_EFFECT: kinhNghiemGain=X]\`\\\` (Chỉ khi \`isCultivationEnabled=true\`):** Dùng khi nhân vật có cơ duyên đột phá khỏi bình cảnh. \`X\` là lượng kinh nghiệm nhỏ (ví dụ 1 hoặc 10) được cộng thêm để vượt qua giới hạn cũ. Tag này sẽ tự động đặt \`hieuUngBinhCanh=false\`.
    *   **VÍ DỤ (Allowed):** \`[REMOVE_BINH_CANH_EFFECT: kinhNghiemGain=10]\`\\\`

**16. LỰA CHỌN HÀNH ĐỘNG MỚI (QUAN TRỌNG):**
    *   Luôn cung cấp 3 đến 4 lựa chọn hành động mới.
    *   **ĐỊNH DẠNG BẮT BUỘC CHO MỖI LỰA CHỌN:** \\\`[CHOICE: "Nội dung lựa chọn (Thành công: X% - Độ khó '${worldConfig?.difficulty || 'Thường'}', Lợi ích: Mô tả lợi ích khi thành công. Rủi ro: Mô tả rủi ro khi thất bại)"]\`\\\`.
    *   \`X%\`: Tỉ lệ thành công ước tính. PHẢI phản ánh Độ Khó của game (xem hướng dẫn ở trên).
    *   \`Lợi ích\`: Mô tả rõ ràng những gì người chơi có thể nhận được nếu hành động thành công (ví dụ: vật phẩm, kinh nghiệm, thông tin, thay đổi thiện cảm NPC, tiến triển nhiệm vụ).
    *   \`Rủi ro\`: Mô tả rõ ràng những hậu quả tiêu cực nếu hành động thất bại (ví dụ: mất máu, bị phát hiện, nhiệm vụ thất bại, giảm thiện cảm).
    *   **Ví dụ (Độ khó 'Thường'):** \\\`[CHOICE: "Thử thuyết phục lão nông (Thành công: 65% - Độ khó 'Thường', Lợi ích: Biết được lối vào bí mật, +10 thiện cảm. Rủi ro: Bị nghi ngờ, -5 thiện cảm, lão nông báo quan)"]\`\\\`
    *   **Ví dụ (Độ khó 'Ác Mộng'):** \\\`[CHOICE: "Một mình đối đầu Hắc Long (Thành công: 20% - Độ khó 'Ác Mộng', Lợi ích: Nếu thắng, nhận danh hiệu 'Diệt Long Giả', vô số bảo vật. Rủi ro: Gần như chắc chắn tử vong, mất toàn bộ vật phẩm không khóa)"]\`\\\`

**17. Tăng lượt chơi:** Kết thúc phản hồi bằng tag \\\`[STATS_UPDATE: turn=+1]\\\`. **KHÔNG được quên tag này.**
**18. Duy trì tính logic và nhất quán của câu chuyện.** **QUAN TRỌNG:** Diễn biến tiếp theo của bạn PHẢI phản ánh kết quả (thành công hay thất bại) của hành động người chơi đã chọn, dựa trên Tỉ Lệ Thành Công, Lợi Ích và Rủi Ro bạn vừa xác định cho lựa chọn đó. Đừng chỉ kể rằng người chơi đã chọn, hãy kể điều gì đã xảy ra.
**19. Mô tả kết quả hành động một cách chi tiết và hấp dẫn.**
**20. Trao Kinh Nghiệm (nếu có hệ thống):** Khi nhân vật hoàn thành hành động có ý nghĩa, sử dụng tag \\\`[STATS_UPDATE: kinhNghiem=+X%]\`\\\` hoặc \\\`[STATS_UPDATE: kinhNghiem=+X]\\\`\\\`.
**21. RẤT QUAN TRỌNG** Khi không có nhiệm vu hiện tại thì hãy ưu tiên đưa ra cho người chơi thêm nhiệm vụ mới dựa vào câu chuyện hiện tại và mục tiêu, phương hướng của nhân vật chính.
**22. QUAN TRỌNG**Khi có tình huống có đặc biệt nào đó hãy đưa ra nhiệm vụ mới cho người chơi. Khi có từ 5 nhiệm vụ đang làm trở lên thì hạn chế đưa thêm nhiệm vụ trừ khi gặp tình huống cực kỳ đặc biệt.
**23. ${isCultivationEnabled ? `**CẤM TUYỆT ĐỐI (NẾU CÓ TU LUYỆN):** KHÔNG tự tạo ra các thông báo (qua tag \\\`[MESSAGE: ...]\`\\\`) hoặc diễn biến trong lời kể (narration) liên quan đến việc nhân vật LÊN CẤP, ĐỘT PHÁ CẢNH GIỚI, hay ĐẠT ĐẾN MỘT CẢNH GIỚI CỤ THỂ. Hệ thống game sẽ tự động xử lý. Bạn chỉ tập trung vào việc mô tả sự kiện và trao thưởng kinh nghiệm.` : `**LƯU Ý (NẾU KHÔNG CÓ TU LUYỆN):** Nhân vật là người thường, không có đột phá cảnh giới. Tập trung vào diễn biến thực tế, kỹ năng đời thường, mối quan hệ, v.v.`}
**24. CẤM TUYỆT ĐỐI:** Khi trả về một tag, dòng chứa tag đó KHÔNG ĐƯỢC chứa bất kỳ ký tự backslash ("\\") nào khác ngoài những ký tự cần thiết bên trong giá trị của tham số (ví dụ như trong chuỗi JSON của \`statBonusesJSON\`).
**25. CẤM TUYỆT ĐỐI:** Không trả về "Hệ thống: câu lệnh hệ thống " mà bắt buộc sử dụng tag đã được quy định khi muốn thêm, thay đổi, xóa bất cứ thực thể hay hiệu ứng nào.
**26. QUAN TRỌNG VỀ MỐI QUAN HỆ NPC:** Mối quan hệ giữa NPC và người chơi (\`relationshipToPlayer\`) có thể và nên thay đổi liên tục. Dựa vào diễn biến câu chuyện và thay đổi về độ thiện cảm (\`affinity\`), hãy chủ động cập nhật mối quan hệ này bằng tag \\\`[NPC_UPDATE: name="Tên NPC", relationshipToPlayer="Mối quan hệ mới"]\\\`. Ví dụ, một 'Kẻ thù' có thể trở thành 'Đồng minh' sau một sự kiện hợp tác, hoặc một 'Bằng hữu' trở thành 'Đối thủ' do mâu thuẫn.
**27. CẤM TUYỆT ĐỐI VỀ ĐỊA ĐIỂM:** Chỉ sử dụng tag \`[MAINLOCATION: ...]\` để tạo các địa điểm chính trên bản đồ thế giới (như thành phố, làng mạc, hang động). KHÔNG sử dụng tag \`[SUBLOCATION: ...]\` trong phản hồi này. Các địa điểm phụ bên trong một địa điểm chính sẽ được tạo ra tự động khi người chơi lần đầu đến đó.

**BỐI CẢNH KHỞI ĐẦU:**
Người chơi sẽ bắt đầu cuộc phiêu lưu tại địa điểm: "${worldConfig.startingLocations?.[0]?.name || 'một nơi vô định'}".
Hãy bắt đầu lời kể của bạn bằng cách mô tả cảnh vật và tình huống của nhân vật tại địa điểm khởi đầu này.

**TIẾP TỤC CÂU CHUYỆN:** Dựa trên **HƯỚNG DẪN TỪ NGƯỜI CHƠI**, **ĐỘ DÀI PHẢN HỒI MONG MUỐN** và **TOÀN BỘ BỐI CẢNH GAME**, hãy tiếp tục câu chuyện cho thể loại "${effectiveGenre}". Mô tả kết quả, cập nhật trạng thái game bằng tags, và cung cấp các lựa chọn hành động mới (theo định dạng đã hướng dẫn ở mục 16). Và đưa ra ít nhất một nhiệm vụ khởi đầu dựa trên mục tiêu của nhân vật.
`};
