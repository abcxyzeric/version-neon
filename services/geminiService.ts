



import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold, CountTokensResponse } from "@google/genai";
import { KnowledgeBase, ParsedAiResponse, AiChoice, WorldSettings, ApiConfig, SafetySetting, PlayerActionInputType, ResponseLength, StartingSkill, StartingItem, StartingNPC, StartingLore, GameMessage, GeneratedWorldElements, StartingLocation, StartingFaction, PlayerStats, Item as ItemType, GenreType, ViolenceLevel, StoryTone, NsfwDescriptionStyle, TuChatTier, TU_CHAT_TIERS, AuctionItem, GameLocation, AuctionState, WorldDate, CongPhapGrade, CongPhapType, LinhKiActivationType, LinhKiCategory, ProfessionGrade, ProfessionType, FindLocationParams, NPC, Skill, Prisoner, Wife, Slave, CombatEndPayload, RaceCultivationSystem, StartingYeuThu, AuctionSlave } from '../types'; 
import { PROMPT_FUNCTIONS as PROMPT_FUNCTIONS, VIETNAMESE, API_SETTINGS_STORAGE_KEY, DEFAULT_MODEL_ID, HARM_CATEGORIES, DEFAULT_API_CONFIG, MAX_TOKENS_FANFIC, ALL_FACTION_ALIGNMENTS, AVAILABLE_GENRES, CUSTOM_GENRE_VALUE, AVAILABLE_MODELS, DEFAULT_VIOLENCE_LEVEL, DEFAULT_STORY_TONE, DEFAULT_NSFW_DESCRIPTION_STYLE, AVAILABLE_AVATAR_ENGINES, DEFAULT_AVATAR_GENERATION_ENGINE } from '../constants';
import * as GameTemplates from '../templates';
import { generateImageWithImagen3 } from './ImageGenerator'; 
import { generateImageWithGemini2Flash } from './imagegengemini2.0';

// Rate Limiting constants and state
const RATE_LIMIT_MODEL_ID = 'gemini-2.5-flash';
const MAX_REQUESTS_PER_MINUTE = 5;
const TIME_WINDOW_MS = 60 * 1000; // 1 minute
let requestTimestamps: number[] = [];

let ai: GoogleGenAI | null = null;
let lastUsedEffectiveApiKey: string | null = null;
let lastUsedApiKeySource: 'system' | 'user' | null = null;
let lastUsedModelForClient: string | null = null;
let currentApiKeyIndex = 0; // for round-robin

// New type for parsed combat response
export interface ParsedCombatResponse {
  narration: string;
  choices: AiChoice[];
  statUpdates: Array<{ targetId: string; stat: keyof PlayerStats; change: number }>;
  combatEnd: 'victory' | 'defeat' | 'escaped' | 'surrendered' | null;
}


export const getApiSettings = (): ApiConfig => {
  const storedSettings = localStorage.getItem(API_SETTINGS_STORAGE_KEY);
  if (storedSettings) {
    try {
      const parsed = JSON.parse(storedSettings);

      const validSafetySettings =
        parsed.safetySettings &&
        Array.isArray(parsed.safetySettings) &&
        parsed.safetySettings.length === HARM_CATEGORIES.length &&
        parsed.safetySettings.every((setting: any) =>
          typeof setting.category === 'string' &&
          typeof setting.threshold === 'string' &&
          HARM_CATEGORIES.some(cat => cat.id === setting.category)
        );
      
      const modelExists = AVAILABLE_MODELS.some(m => m.id === parsed.model);
      const avatarEngineExists = AVAILABLE_AVATAR_ENGINES.some(e => e.id === parsed.avatarGenerationEngine);
      const ragTopKIsValid = typeof parsed.ragTopK === 'number' && parsed.ragTopK >= 0 && parsed.ragTopK <= 100;

      // Handle user API keys with backward compatibility
      let userApiKeys: string[] = [''];
      if (parsed.userApiKeys && Array.isArray(parsed.userApiKeys) && parsed.userApiKeys.length > 0) {
        userApiKeys = parsed.userApiKeys;
      } else if (parsed.userApiKey && typeof parsed.userApiKey === 'string' && parsed.userApiKey.trim() !== '') {
        // Legacy support for old string-based userApiKey
        userApiKeys = [parsed.userApiKey];
      }

      return {
        apiKeySource: parsed.apiKeySource || DEFAULT_API_CONFIG.apiKeySource,
        userApiKeys: userApiKeys,
        model: modelExists ? parsed.model : DEFAULT_API_CONFIG.model,
        economyModel: parsed.economyModel || (modelExists ? parsed.model : DEFAULT_API_CONFIG.model),
        safetySettings: validSafetySettings ? parsed.safetySettings : DEFAULT_API_CONFIG.safetySettings,
        autoGenerateNpcAvatars: parsed.autoGenerateNpcAvatars === undefined ? DEFAULT_API_CONFIG.autoGenerateNpcAvatars : parsed.autoGenerateNpcAvatars,
        avatarGenerationEngine: avatarEngineExists ? parsed.avatarGenerationEngine : DEFAULT_API_CONFIG.avatarGenerationEngine,
        ragTopK: ragTopKIsValid ? parsed.ragTopK : DEFAULT_API_CONFIG.ragTopK,
      };
    } catch (e) {
      console.error("Failed to parse API settings from localStorage, using defaults:", e);
    }
  }
  return { ...DEFAULT_API_CONFIG }; 
};

const getAiClient = (): GoogleGenAI => {
  const settings = getApiSettings();
  let effectiveApiKey: string;

  if (settings.apiKeySource === 'system') {
    const systemApiKey = process.env.API_KEY; 

    if (typeof systemApiKey !== 'string' || systemApiKey.trim() === '') {
        throw new Error(VIETNAMESE.apiKeySystemUnavailable + " (API_KEY not found in environment)");
    }
    effectiveApiKey = systemApiKey;
  } else {
    const validKeys = settings.userApiKeys.filter(k => k && k.trim() !== '');
    if (validKeys.length === 0) {
      throw new Error(VIETNAMESE.apiKeyMissing);
    }
    // Round-robin key selection
    if (currentApiKeyIndex >= validKeys.length) {
        currentApiKeyIndex = 0; // Wrap around
    }
    effectiveApiKey = validKeys[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % validKeys.length;
  }

  if (!ai || lastUsedApiKeySource !== settings.apiKeySource || lastUsedEffectiveApiKey !== effectiveApiKey || lastUsedModelForClient !== settings.model) {
    try {
      ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      lastUsedEffectiveApiKey = effectiveApiKey;
      lastUsedApiKeySource = settings.apiKeySource;
      lastUsedModelForClient = settings.model; 
    } catch (initError) {
        console.error("Failed to initialize GoogleGenAI client:", initError);
        if (settings.apiKeySource === 'system') {
            throw new Error(`${VIETNAMESE.apiKeySystemUnavailable} Details: ${initError instanceof Error ? initError.message : String(initError)} (Using system key: API_KEY)`);
        } else {
            throw new Error(`Lỗi khởi tạo API Key người dùng: ${initError instanceof Error ? initError.message : String(initError)}`);
        }
    }
  }
  return ai;
};

const parseTagParams = (paramString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    if (!paramString) return params;

    const parts: string[] = [];
    let quoteChar: "'" | '"' | null = null;
    let lastSplit = 0;
    let balance = 0; // for nested objects/arrays

    for (let i = 0; i < paramString.length; i++) {
        const char = paramString[i];

        if (quoteChar) {
            if (char === quoteChar && (i === 0 || paramString[i - 1] !== '\\')) {
                quoteChar = null;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quoteChar = char;
            continue;
        }

        if (char === '{' || char === '[') {
            balance++;
        } else if (char === '}' || char === ']') {
            balance--;
        }

        if (char === ',' && balance === 0) {
            parts.push(paramString.substring(lastSplit, i));
            lastSplit = i + 1;
        }
    }
    parts.push(paramString.substring(lastSplit));

    for (const part of parts) {
        if (!part.trim()) continue;
        
        const eqIndex = part.indexOf('=');
        if (eqIndex === -1) {
            console.warn(`Could not parse key-value pair from part: "${part}"`);
            continue;
        }

        const rawKey = part.substring(0, eqIndex).trim();
        // The fix is here: normalize the key by removing spaces
        const key = rawKey.replace(/\s+/g, '');
        let value = part.substring(eqIndex + 1).trim();
        
        const firstChar = value.charAt(0);
        const lastChar = value.charAt(value.length - 1);
        if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
            value = value.substring(1, value.length - 1);
        }
        
        params[key] = value.replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    
    return params;
};


export const parseAiResponseText = (responseText: string): ParsedAiResponse => {
  let narration = responseText;
  const choices: AiChoice[] = [];
  const gameStateTags: string[] = [];
  let systemMessage: string | undefined;

  narration = narration
    .split('\n')
    .filter(line => !/^\s*`+\s*$/.test(line)) // Remove lines with only backticks
    .join('\n');

  narration = narration
    .split('\n')
    .filter(line => !/^\s*\*+\s*$/.test(line)) // Remove lines with only asterisks (often separators)
    .join('\n');

  narration = narration
    .split('\n')
    .filter(line => !/^\s*-{3,}\s*$/.test(line)) // Remove lines with only hyphens (often separators)
    .join('\n');

  const lines = narration.split('\n');
  const remainingLinesForNarration: string[] = [];

  for (const line of lines) {
    let currentLineForChoiceParsing = line.trim();
    let choiceContent: string | null = null;

    const wrapperMatch = currentLineForChoiceParsing.match(/^(?:\s*(`{1,3}|\*{2,})\s*)(.*?)(\s*\1\s*)$/);
    if (wrapperMatch && wrapperMatch[2] && wrapperMatch[2].toUpperCase().includes("[CHOICE:")) {
        currentLineForChoiceParsing = wrapperMatch[2].trim();
    }
    
    const choiceTagMatch = currentLineForChoiceParsing.match(/^(?:\[CHOICE:\s*)(.*?)(\]?)?$/i);

    if (choiceTagMatch && choiceTagMatch[1]) {
      choiceContent = choiceTagMatch[1].trim();
      choiceContent = choiceContent.replace(/(\s*(?:`{1,3}|\*{2,})\s*)$/, "").trim();
      choiceContent = choiceContent.replace(/^["']|["']$/g, '');
      choiceContent = choiceContent.replace(/\\'/g, "'");
      choiceContent = choiceContent.replace(/\\(?![btnfrv'"\\])/g, "");
      choices.push({ text: choiceContent });
    } else {
      remainingLinesForNarration.push(line);
    }
  }
  narration = remainingLinesForNarration.join('\n');
  
  const allTagsRegex = /\[(.*?)\]/g;
  const foundRawTags: {fullTag: string, content: string}[] = [];
  let tempMatch;
  
  while ((tempMatch = allTagsRegex.exec(narration)) !== null) {
      foundRawTags.push({fullTag: tempMatch[0], content: tempMatch[1].trim()});
  }

  for (const tagInfo of foundRawTags) {
    const { fullTag, content } = tagInfo; 
    
    if (narration.includes(fullTag)) {
        narration = narration.replace(fullTag, '');
    }

    const colonIndex = content.indexOf(':');
    const tagNamePart = (colonIndex === -1 ? content : content.substring(0, colonIndex)).trim().toUpperCase();
    const tagValuePart = colonIndex === -1 ? "" : content.substring(colonIndex + 1).trim();

    if (tagNamePart === 'MESSAGE') {
      try {
        systemMessage = tagValuePart.replace(/^["']|["']$/g, '');
      } catch (e) { /* silent */ }
    } else if (tagNamePart === 'CHOICE') {
      let choiceText = tagValuePart;
      choiceText = choiceText.replace(/(\s*(?:`{1,3}|\*{2,})\s*)$/, "").trim();
      choiceText = choiceText.replace(/^["']|["']$/g, '');
      choiceText = choiceText.replace(/\\'/g, "'");
      choiceText = choiceText.replace(/\\(?![btnfrv'"\\])/g, "");
      choices.push({ text: choiceText });
    } else if (!tagNamePart.startsWith('GENERATED_')) {
      gameStateTags.push(fullTag);
    }
  }

  narration = narration.replace(/\\/g, '');
  narration = narration.replace(/(?<!\w)`(?!\w)/g, '');
  narration = narration.replace(/(?<!\w)\*(?!\w)/g, '');


  narration = narration
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  narration = narration.replace(/\n\s*\n/g, '\n').trim();

  return { narration, choices, tags: gameStateTags, systemMessage };
};

export const parseGeneratedWorldDetails = (responseText: string): GeneratedWorldElements => {
  const GWD_SKILL = 'GENERATED_SKILL:';
  const GWD_ITEM = 'GENERATED_ITEM:';
  const GWD_NPC = 'GENERATED_NPC:';
  const GWD_YEUTHU = 'GENERATED_YEUTHU:';
  const GWD_LORE = 'GENERATED_LORE:';
  const GWD_LOCATION = 'GENERATED_LOCATION:';
  const GWD_FACTION = 'GENERATED_FACTION:';
  const GWD_PLAYER_NAME = 'GENERATED_PLAYER_NAME:';
  const GWD_PLAYER_GENDER = 'GENERATED_PLAYER_GENDER:';
  const GWD_PLAYER_RACE = 'GENERATED_PLAYER_RACE:';
  const GWD_PLAYER_PERSONALITY = 'GENERATED_PLAYER_PERSONALITY:';
  const GWD_PLAYER_BACKSTORY = 'GENERATED_PLAYER_BACKSTORY:';
  const GWD_PLAYER_GOAL = 'GENERATED_PLAYER_GOAL:';
  const GWD_PLAYER_STARTING_TRAITS = 'GENERATED_PLAYER_STARTING_TRAITS:';
  const GWD_PLAYER_AVATAR_URL = 'GENERATED_PLAYER_AVATAR_URL:'; 
  const GWD_WORLD_THEME = 'GENERATED_WORLD_THEME:';
  const GWD_WORLD_SETTING_DESCRIPTION = 'GENERATED_WORLD_SETTING_DESCRIPTION:';
  const GWD_WORLD_WRITING_STYLE = 'GENERATED_WORLD_WRITING_STYLE:';
  const GWD_CURRENCY_NAME = 'GENERATED_CURRENCY_NAME:';
  const GWD_ORIGINAL_STORY_SUMMARY = 'GENERATED_ORIGINAL_STORY_SUMMARY:';
  const GWD_RACE_SYSTEM = 'GENERATED_RACE_SYSTEM:'; // NEW
  const GWD_YEUTHU_SYSTEM = 'GENERATED_YEUTHU_SYSTEM:'; // NEW
  const GWD_HE_THONG_CANH_GIOI = 'GENERATED_HE_THONG_CANH_GIOI:'; // LEGACY, for backward compat if AI still sends it
  const GWD_CANH_GIOI_KHOI_DAU = 'GENERATED_CANH_GIOI_KHOI_DAU:';
  const GWD_GENRE = 'GENERATED_GENRE:';
  const GWD_CUSTOM_GENRE_NAME = 'GENERATED_CUSTOM_GENRE_NAME:'; 
  const GWD_IS_CULTIVATION_ENABLED = 'GENERATED_IS_CULTIVATION_ENABLED:';
  const GWD_NSFW_STYLE = 'GENERATED_NSFW_DESCRIPTION_STYLE:';
  const GWD_VIOLENCE_LEVEL = 'GENERATED_VIOLENCE_LEVEL:';
  const GWD_STORY_TONE = 'GENERATED_STORY_TONE:';
  const GWD_STARTING_DATE = 'GENERATED_STARTING_DATE:';
  const GWD_PLAYER_SPIRITUAL_ROOT = 'GENERATED_PLAYER_SPIRITUAL_ROOT:';
  const GWD_PLAYER_SPECIAL_PHYSIQUE = 'GENERATED_PLAYER_SPECIAL_PHYSIQUE:';
  const GWD_PLAYER_THO_NGUYEN = 'GENERATED_PLAYER_THO_NGUYEN:';
  const GWD_PLAYER_MAX_THO_NGUYEN = 'GENERATED_PLAYER_MAX_THO_NGUYEN:';
  const GWD_STARTING_CURRENCY = 'GENERATED_STARTING_CURRENCY:';


  const generated: GeneratedWorldElements = {
    startingSkills: [],
    startingItems: [],
    startingNPCs: [],
    startingLore: [],
    startingYeuThu: [],
    startingLocations: [],
    startingFactions: [],
    raceCultivationSystems: [], // NEW
    yeuThuRealmSystem: '', // NEW
    genre: AVAILABLE_GENRES[0], 
    isCultivationEnabled: true,
    nsfwDescriptionStyle: DEFAULT_NSFW_DESCRIPTION_STYLE,
    violenceLevel: DEFAULT_VIOLENCE_LEVEL, 
    storyTone: DEFAULT_STORY_TONE, 
  };

  const originalStorySummaryRegex = /\[GENERATED_ORIGINAL_STORY_SUMMARY:\s*text\s*=\s*(?:"((?:\\.|[^"\\])*?)"|'((?:\\.|[^'\\])*?)')\s*\]/is;
  const originalStorySummaryMatch = responseText.match(originalStorySummaryRegex);

  if (originalStorySummaryMatch) {
    let summaryText = originalStorySummaryMatch[1] !== undefined ? originalStorySummaryMatch[1] : originalStorySummaryMatch[2];
    if (summaryText !== undefined) {
      generated.originalStorySummary = summaryText
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
    }
    responseText = responseText.replace(originalStorySummaryMatch[0], '');
  }


  const lines = responseText.split('\n');
  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith(`[${GWD_SKILL}`)) {
        const content = line.substring(line.indexOf(GWD_SKILL) + GWD_SKILL.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if (!name) return;
        const description = params.description || "Kỹ năng do AI tạo, chưa có mô tả.";
        const skillType = params.skillType as GameTemplates.SkillTypeValues | undefined;
        
        const newSkill: StartingSkill = {
            name,
            description,
            skillType,
            baseDamage: params.baseDamage ? parseInt(params.baseDamage) : undefined,
            baseHealing: params.baseHealing ? parseInt(params.baseHealing) : undefined,
            damageMultiplier: params.damageMultiplier ? parseFloat(params.damageMultiplier) : undefined,
            healingMultiplier: params.healingMultiplier ? parseFloat(params.healingMultiplier) : undefined,
            manaCost: params.manaCost ? parseInt(params.manaCost) : undefined,
            cooldown: params.cooldown ? parseInt(params.cooldown) : undefined,
            specialEffects: params.otherEffects || params.specialEffects,
            congPhapDetails: skillType === GameTemplates.SkillType.CONG_PHAP_TU_LUYEN ? {
                type: params.congPhapType as CongPhapType,
                grade: params.congPhapGrade as CongPhapGrade,
                weaponFocus: params.weaponFocus
            } : undefined,
            linhKiDetails: skillType === GameTemplates.SkillType.LINH_KI ? {
                category: params.linhKiCategory as LinhKiCategory,
                activation: params.linhKiActivation as LinhKiActivationType
            } : undefined,
            professionDetails: skillType === GameTemplates.SkillType.NGHE_NGHIEP ? {
                type: params.professionType as ProfessionType,
                grade: params.professionGrade as ProfessionGrade,
                skillDescription: params.skillDescription
            } : undefined,
            camThuatDetails: skillType === GameTemplates.SkillType.CAM_THUAT ? {
                sideEffects: params.sideEffects
            } : undefined,
            thanThongDetails: skillType === GameTemplates.SkillType.THAN_THONG ? {} : undefined
        };
    
        if (!newSkill.congPhapDetails?.type) delete newSkill.congPhapDetails;
        if (!newSkill.linhKiDetails?.category && !newSkill.linhKiDetails?.activation) delete newSkill.linhKiDetails;
        if (!newSkill.professionDetails?.type) delete newSkill.professionDetails;
        if (!newSkill.camThuatDetails?.sideEffects) delete newSkill.camThuatDetails;
        
        generated.startingSkills.push(newSkill);

    } else if (line.startsWith(`[${GWD_ITEM}`)) {
        const content = line.substring(line.indexOf(GWD_ITEM) + GWD_ITEM.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if (!name) return;
        const description = params.description || "Vật phẩm do AI tạo, chưa có mô tả.";
        const quantity = parseInt(params.quantity || "1", 10);
         if (isNaN(quantity) || quantity < 1) return;
        const category = params.category as GameTemplates.ItemCategoryValues;
        if (!category || !Object.values(GameTemplates.ItemCategory).includes(category)) return;
        const rarity = params.rarity as GameTemplates.EquipmentRarity || GameTemplates.ItemRarity.PHO_THONG;
        const value = params.value ? parseInt(params.value, 10) : 0;
        const startingItem: StartingItem = {
            name, description, quantity, category,
            rarity: Object.values(GameTemplates.ItemRarity).includes(rarity) ? rarity : GameTemplates.ItemRarity.PHO_THONG,
            value: !isNaN(value) ? value : 0,
            itemRealm: params.itemRealm, // Added itemRealm parsing
            aiPreliminaryType: params.type
        };
        if (category === GameTemplates.ItemCategory.EQUIPMENT) {
            const equipmentType = params.equipmentType as GameTemplates.EquipmentTypeValues;
            if (equipmentType && Object.values(GameTemplates.EquipmentType).includes(equipmentType)) {
                startingItem.equipmentDetails = { type: equipmentType, slot: params.slot, uniqueEffectsString: params.uniqueEffectsList };
                if (params.statBonusesJSON) {
                    startingItem.equipmentDetails.statBonusesString = params.statBonusesJSON;
                } else if (params.statBonuses) {
                     startingItem.equipmentDetails.statBonusesString = params.statBonuses;
                }
            } 
        } else if (category === GameTemplates.ItemCategory.POTION) {
            const potionType = params.potionType as GameTemplates.PotionTypeValues;
             if (potionType && Object.values(GameTemplates.PotionType).includes(potionType)) {
                startingItem.potionDetails = {
                    type: potionType, effectsString: params.effectsList,
                    durationTurns: params.durationTurns ? parseInt(params.durationTurns, 10) : undefined,
                    cooldownTurns: params.cooldownTurns ? parseInt(params.cooldownTurns, 10) : undefined,
                };
            } 
        } else if (category === GameTemplates.ItemCategory.MATERIAL) {
            const materialType = params.materialType as GameTemplates.MaterialTypeValues;
            if (materialType && Object.values(GameTemplates.MaterialType).includes(materialType)) {
                startingItem.materialDetails = { type: materialType };
            } else {
                 startingItem.materialDetails = { type: GameTemplates.MaterialType.KHAC }; 
            }
        } else if (category === GameTemplates.ItemCategory.QUEST_ITEM) {
            startingItem.questItemDetails = { questIdAssociated: params.questIdAssociated };
        } else if (category === GameTemplates.ItemCategory.MISCELLANEOUS) {
            startingItem.miscDetails = {
                usable: params.usable?.toLowerCase() === 'true',
                consumable: params.consumable?.toLowerCase() === 'true',
            };
        } else if (category === GameTemplates.ItemCategory.CONG_PHAP) {
            const congPhapType = params.congPhapType as GameTemplates.CongPhapType;
            if (congPhapType && Object.values(GameTemplates.CongPhapType).includes(congPhapType)) {
                startingItem.congPhapDetails = { congPhapType, expBonusPercentage: parseInt(params.expBonusPercentage || '0') };
            }
        } else if (category === GameTemplates.ItemCategory.LINH_KI) {
            if (params.skillToLearnJSON) {
                startingItem.linhKiDetails = { skillToLearnJSON: params.skillToLearnJSON };
            }
        } else if (category === GameTemplates.ItemCategory.PROFESSION_SKILL_BOOK) {
            const profession = params.professionToLearn as GameTemplates.ProfessionType;
            if (profession && Object.values(GameTemplates.ProfessionType).includes(profession)) {
                startingItem.professionSkillBookDetails = { professionToLearn: profession };
            }
        } else if (category === GameTemplates.ItemCategory.PROFESSION_TOOL) {
            const profession = params.professionRequired as GameTemplates.ProfessionType;
            if (profession && Object.values(GameTemplates.ProfessionType).includes(profession)) {
                startingItem.professionToolDetails = { professionRequired: profession };
            }
        }
        generated.startingItems.push(startingItem);
    } else if (line.startsWith(`[${GWD_NPC}`)) {
        const content = line.substring(line.indexOf(GWD_NPC) + GWD_NPC.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if (!name) return;
        const personality = params.personality || "Bí ẩn";
        const details = params.details || "Không có thông tin chi tiết.";
        const initialAffinity = parseInt(params.initialAffinity || "0", 10);
        const gender = params.gender as StartingNPC['gender'] || 'Không rõ';
        const realm = params.realm;
        const avatarUrl = params.avatarUrl;
        const tuChat = params.tuChat as TuChatTier;
        const relationshipToPlayer = params.relationshipToPlayer;
        if (!isNaN(initialAffinity)) {
            generated.startingNPCs.push({
                name, personality, initialAffinity: Math.max(-100, Math.min(100, initialAffinity)), details, gender, realm,
                race: params.race,
                avatarUrl: avatarUrl || undefined,
                tuChat: TU_CHAT_TIERS.includes(tuChat) ? tuChat : "Trung Đẳng",
                relationshipToPlayer: relationshipToPlayer || undefined,
                spiritualRoot: params.spiritualRoot,
                specialPhysique: params.specialPhysique,
                thoNguyen: params.thoNguyen ? parseInt(params.thoNguyen, 10) : undefined,
                maxThoNguyen: params.maxThoNguyen ? parseInt(params.maxThoNguyen, 10) : undefined,
            });
        } 
    } else if (line.startsWith(`[${GWD_YEUTHU}`)) {
        const content = line.substring(line.indexOf(GWD_YEUTHU) + GWD_YEUTHU.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if (!name) return;
        const species = params.species || "Không rõ";
        const description = params.description || "Không có mô tả.";
        const realm = params.realm;
        const isHostile = params.isHostile?.toLowerCase() === 'true';

        if (!generated.startingYeuThu) {
            generated.startingYeuThu = [];
        }
        generated.startingYeuThu.push({
            name,
            species,
            description,
            realm: realm || undefined,
            isHostile
        });
    } else if (line.startsWith(`[${GWD_LORE}`)) {
        const content = line.substring(line.indexOf(GWD_LORE) + GWD_LORE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const title = params.title;
        if (!title) return;
        const loreContent = params.content || "Nội dung tri thức chưa được cung cấp.";
        generated.startingLore.push({ title, content: loreContent });
    } else if (line.startsWith(`[${GWD_LOCATION}`)) {
        const content = line.substring(line.indexOf(GWD_LOCATION) + GWD_LOCATION.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if(!name) return;
        const description = params.description || "Địa điểm chưa có mô tả.";
        const mapX = params.mapX ? parseInt(params.mapX, 10) : undefined;
        const mapY = params.mapY ? parseInt(params.mapY, 10) : undefined;
        const locationType = params.locationType?.trim() as GameTemplates.LocationTypeValues;
        const validLocationType = locationType && Object.values(GameTemplates.LocationType).includes(locationType) 
            ? locationType 
            : GameTemplates.LocationType.DEFAULT;
        if (!generated.startingLocations) generated.startingLocations = [];
        generated.startingLocations.push({
            name, description,
            isSafeZone: params.isSafeZone?.toLowerCase() === 'true',
            regionId: params.regionId || undefined,
            mapX: !isNaN(mapX as number) ? mapX : undefined,
            mapY: !isNaN(mapY as number) ? mapY : undefined,
            locationType: validLocationType,
        });
    } else if (line.startsWith(`[${GWD_FACTION}`)) { 
        const content = line.substring(line.indexOf(GWD_FACTION) + GWD_FACTION.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const name = params.name;
        if (!name) return;
        const description = params.description || "Phe phái chưa có mô tả.";
        let alignment = params.alignment as GameTemplates.FactionAlignmentValues || GameTemplates.FactionAlignment.TRUNG_LAP;
        if (!ALL_FACTION_ALIGNMENTS.includes(alignment)) alignment = GameTemplates.FactionAlignment.TRUNG_LAP;
        const initialPlayerReputation = parseInt(params.initialPlayerReputation || "0", 10);
        if (isNaN(initialPlayerReputation)) return;
        if (!generated.startingFactions) generated.startingFactions = [];
        generated.startingFactions.push({
            name, description, alignment,
            initialPlayerReputation: Math.max(-100, Math.min(100, initialPlayerReputation))
        });
    } else if (line.startsWith(`[${GWD_PLAYER_NAME}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_NAME) + GWD_PLAYER_NAME.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.name) generated.playerName = params.name;
    } else if (line.startsWith(`[${GWD_PLAYER_GENDER}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_GENDER) + GWD_PLAYER_GENDER.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.gender && ['Nam', 'Nữ', 'Khác'].includes(params.gender)) {
            generated.playerGender = params.gender as 'Nam' | 'Nữ' | 'Khác';
        }
    } else if (line.startsWith(`[${GWD_PLAYER_RACE}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_RACE) + GWD_PLAYER_RACE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerRace = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_PERSONALITY}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_PERSONALITY) + GWD_PLAYER_PERSONALITY.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerPersonality = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_BACKSTORY}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_BACKSTORY) + GWD_PLAYER_BACKSTORY.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerBackstory = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_GOAL}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_GOAL) + GWD_PLAYER_GOAL.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerGoal = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_STARTING_TRAITS}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_STARTING_TRAITS) + GWD_PLAYER_STARTING_TRAITS.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerStartingTraits = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_AVATAR_URL}`)) { 
        const content = line.substring(line.indexOf(GWD_PLAYER_AVATAR_URL) + GWD_PLAYER_AVATAR_URL.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.url) generated.playerAvatarUrl = params.url; 
    } else if (line.startsWith(`[${GWD_WORLD_THEME}`)) {
        const content = line.substring(line.indexOf(GWD_WORLD_THEME) + GWD_WORLD_THEME.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.worldTheme = params.text;
    } else if (line.startsWith(`[${GWD_WORLD_SETTING_DESCRIPTION}`)) {
        const content = line.substring(line.indexOf(GWD_WORLD_SETTING_DESCRIPTION) + GWD_WORLD_SETTING_DESCRIPTION.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.worldSettingDescription = params.text;
    } else if (line.startsWith(`[${GWD_WORLD_WRITING_STYLE}`)) {
        const content = line.substring(line.indexOf(GWD_WORLD_WRITING_STYLE) + GWD_WORLD_WRITING_STYLE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.worldWritingStyle = params.text;
    } else if (line.startsWith(`[${GWD_CURRENCY_NAME}`)) {
        const content = line.substring(line.indexOf(GWD_CURRENCY_NAME) + GWD_CURRENCY_NAME.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.name) generated.currencyName = params.name;
    } else if (line.startsWith(`[${GWD_RACE_SYSTEM}`)) { // NEW
        const content = line.substring(line.indexOf(GWD_RACE_SYSTEM) + GWD_RACE_SYSTEM.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.race && params.system) {
            if (!generated.raceCultivationSystems) generated.raceCultivationSystems = [];
            generated.raceCultivationSystems.push({ id: `gen-${params.race.replace(/\s+/g, '-')}`, raceName: params.race, realmSystem: params.system });
        }
    } else if (line.startsWith(`[${GWD_YEUTHU_SYSTEM}`)) { // NEW
        const content = line.substring(line.indexOf(GWD_YEUTHU_SYSTEM) + GWD_YEUTHU_SYSTEM.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.system) {
            generated.yeuThuRealmSystem = params.system;
        }
    } else if (line.startsWith(`[${GWD_HE_THONG_CANH_GIOI}`)) { // LEGACY Fallback
        const content = line.substring(line.indexOf(GWD_HE_THONG_CANH_GIOI) + GWD_HE_THONG_CANH_GIOI.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text && (!generated.raceCultivationSystems || generated.raceCultivationSystems.length === 0)) {
            // Only use legacy tag if new tag hasn't provided anything.
            generated.raceCultivationSystems = [{ id: 'legacy-human-1', raceName: 'Nhân Tộc', realmSystem: params.text }];
        }
    } else if (line.startsWith(`[${GWD_CANH_GIOI_KHOI_DAU}`)) {
        const content = line.substring(line.indexOf(GWD_CANH_GIOI_KHOI_DAU) + GWD_CANH_GIOI_KHOI_DAU.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.canhGioiKhoiDau = params.text;
    } else if (line.startsWith(`[${GWD_GENRE}`)) {
        const content = line.substring(line.indexOf(GWD_GENRE) + GWD_GENRE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text && (AVAILABLE_GENRES.includes(params.text as GenreType) || params.text === CUSTOM_GENRE_VALUE) ) {
            generated.genre = params.text as GenreType;
        }
    } else if (line.startsWith(`[${GWD_CUSTOM_GENRE_NAME}`)) {
        const content = line.substring(line.indexOf(GWD_CUSTOM_GENRE_NAME) + GWD_CUSTOM_GENRE_NAME.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.customGenreName = params.text;
    } else if (line.startsWith(`[${GWD_IS_CULTIVATION_ENABLED}`)) {
        const content = line.substring(line.indexOf(GWD_IS_CULTIVATION_ENABLED) + GWD_IS_CULTIVATION_ENABLED.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.value) {
            generated.isCultivationEnabled = params.value.toLowerCase() === 'true';
        }
    } else if (line.startsWith(`[${GWD_NSFW_STYLE}`)) {
        const content = line.substring(line.indexOf(GWD_NSFW_STYLE) + GWD_NSFW_STYLE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text && ['Hoa Mỹ', 'Trần Tục', 'Gợi Cảm', 'Mạnh Bạo (BDSM)'].includes(params.text)) {
            generated.nsfwDescriptionStyle = params.text as NsfwDescriptionStyle;
        }
    } else if (line.startsWith(`[${GWD_VIOLENCE_LEVEL}`)) {
        const content = line.substring(line.indexOf(GWD_VIOLENCE_LEVEL) + GWD_VIOLENCE_LEVEL.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text && ['Nhẹ Nhàng', 'Thực Tế', 'Cực Đoan'].includes(params.text)) {
            generated.violenceLevel = params.text as ViolenceLevel;
        }
    } else if (line.startsWith(`[${GWD_STORY_TONE}`)) {
        const content = line.substring(line.indexOf(GWD_STORY_TONE) + GWD_STORY_TONE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text && ['Tích Cực', 'Trung Tính', 'Đen Tối', 'Dâm Dục', 'Hoang Dâm', 'Dâm Loạn'].includes(params.text)) {
            generated.storyTone = params.text as StoryTone;
        }
    } else if (line.startsWith(`[${GWD_STARTING_DATE}`)) {
        const content = line.substring(line.indexOf(GWD_STARTING_DATE) + GWD_STARTING_DATE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        const day = parseInt(params.day, 10);
        const month = parseInt(params.month, 10);
        const year = parseInt(params.year, 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            generated.startingDate = { day, month, year };
        }
    } else if (line.startsWith(`[${GWD_PLAYER_SPIRITUAL_ROOT}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_SPIRITUAL_ROOT) + GWD_PLAYER_SPIRITUAL_ROOT.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerSpiritualRoot = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_SPECIAL_PHYSIQUE}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_SPECIAL_PHYSIQUE) + GWD_PLAYER_SPECIAL_PHYSIQUE.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.text) generated.playerSpecialPhysique = params.text;
    } else if (line.startsWith(`[${GWD_PLAYER_THO_NGUYEN}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_THO_NGUYEN) + GWD_PLAYER_THO_NGUYEN.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.value) generated.playerThoNguyen = parseInt(params.value, 10);
    } else if (line.startsWith(`[${GWD_PLAYER_MAX_THO_NGUYEN}`)) {
        const content = line.substring(line.indexOf(GWD_PLAYER_MAX_THO_NGUYEN) + GWD_PLAYER_MAX_THO_NGUYEN.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.value) generated.playerMaxThoNguyen = parseInt(params.value, 10);
    } else if (line.startsWith(`[${GWD_STARTING_CURRENCY}`)) {
        const content = line.substring(line.indexOf(GWD_STARTING_CURRENCY) + GWD_STARTING_CURRENCY.length, line.lastIndexOf(']')).trim();
        const params = parseTagParams(content);
        if (params.value) {
            const currencyValue = parseInt(params.value, 10);
            if (!isNaN(currencyValue)) {
                generated.startingCurrency = currencyValue;
            }
        }
    }
  });

  return generated;
};


export const callGeminiAPI = async (
  prompt: string,
  onPromptConstructedForLog?: (constructedPrompt: string) => void,
  options?: { model?: string; lowLatency?: boolean }
): Promise<string> => {
  let client: GoogleGenAI;
  try {
    client = getAiClient();
  } catch (clientError) {
    const errorMessage = clientError instanceof Error ? clientError.message : String(clientError);
    throw new Error(`Lỗi API Client: ${errorMessage}`);
  }

  const settings = getApiSettings();
  const modelToUse = options?.model || settings.model;
  const applyLowLatency = options?.lowLatency || false;

  // --- NEW: Rate Limiting Logic ---
  if (modelToUse.includes(RATE_LIMIT_MODEL_ID)) {
    const now = Date.now();
    // Filter out timestamps that are older than the time window
    requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < TIME_WINDOW_MS);

    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
        const oldestRequestTimestamp = requestTimestamps[0] || now;
        const timeToWait = Math.ceil((oldestRequestTimestamp + TIME_WINDOW_MS - now) / 1000);
        const errorMessage = `Đã đạt giới hạn yêu cầu (${MAX_REQUESTS_PER_MINUTE}/phút) cho model ${RATE_LIMIT_MODEL_ID}. Vui lòng thử lại sau ${timeToWait > 0 ? timeToWait : 1} giây.`;
        console.warn(errorMessage);
        throw new Error(errorMessage);
    }

    // Add current request timestamp
    requestTimestamps.push(now);
  }
  // --- END: Rate Limiting Logic ---

  if (onPromptConstructedForLog) {
    onPromptConstructedForLog(prompt);
  }

  try {
    const config: any = {
      safetySettings: settings.safetySettings,
    };
    
    if (applyLowLatency && modelToUse.includes('gemini-2.5-flash')) { // Adjusted to work with any flash variant
      config.thinkingConfig = { thinkingBudget: 0 };
    }

    const response: GenerateContentResponse = await client.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: config,
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Phản hồi từ AI trống rỗng. Điều này có thể do cài đặt an toàn nội dung đã chặn phản hồi, hoặc có vấn đề với prompt/model.");
    }
    return responseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let detailedErrorMessage = error instanceof Error ? error.message : String(error);
    // @ts-ignore
    if (error && error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
         // @ts-ignore
        detailedErrorMessage = `Nội dung đã bị chặn do cài đặt an toàn. Lý do: ${error.response.promptFeedback.blockReason}. Vui lòng điều chỉnh trong Thiết Lập API.`;
         // @ts-ignore
        if (error.response.promptFeedback.safetyRatings && error.response.promptFeedback.safetyRatings.length > 0) {
             // @ts-ignore
            const blockedCategories = error.response.promptFeedback.safetyRatings.filter((r: any) => r.probability !== "NEGLIGIBLE").map((r:any) => `${r.category} (${r.probability})`);
            if(blockedCategories.length > 0) {
                detailedErrorMessage += ` (Các danh mục bị ảnh hưởng: ${blockedCategories.join(', ')})`;
            }
        }
    }
    throw new Error(`${VIETNAMESE.errorOccurred} ${detailedErrorMessage}`);
  }
};

export const generateInitialStory = async (
  worldConfig: WorldSettings,
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{response: ParsedAiResponse, rawText: string}> => {
  const prompt = PROMPT_FUNCTIONS.initial(worldConfig);
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
  const parsedResponse = parseAiResponseText(rawText);
  return {response: parsedResponse, rawText};
};

export const generateNextTurn = async (
  knowledgeBase: KnowledgeBase,
  playerAction: string,
  inputType: PlayerActionInputType,
  responseLength: ResponseLength,
  currentPageMessagesLog: string,
  previousPageSummaries: string[],
  lastNarrationFromPreviousPage?: string,
  retrievedContext?: string, // NEW: For RAG
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{response: ParsedAiResponse, rawText: string}> => {
    // Select the correct prompt function based on the player's status
    const promptFunction = knowledgeBase.playerStats.playerSpecialStatus 
        ? PROMPT_FUNCTIONS.continuePrison
        : PROMPT_FUNCTIONS.continue;

  const prompt = promptFunction(
    knowledgeBase, playerAction, inputType, responseLength,
    currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage,
    retrievedContext // NEW: Pass context to prompt function
  );
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
  const parsedResponse = parseAiResponseText(rawText);
  return {response: parsedResponse, rawText};
};

export const generateWorldDetailsFromStory = async (
  storyIdea: string, isNsfwIdea: boolean, genre: GenreType, isCultivationEnabled: boolean,
  violenceLevel: ViolenceLevel, storyTone: StoryTone, customGenreName?: string,
  nsfwStyle?: NsfwDescriptionStyle, onPromptConstructedForLog?: (prompt: string) => void 
): Promise<{response: GeneratedWorldElements, rawText: string, constructedPrompt: string}> => {
  const constructedPrompt = PROMPT_FUNCTIONS.generateWorldDetails(storyIdea, isNsfwIdea, genre, isCultivationEnabled, violenceLevel, storyTone, customGenreName, nsfwStyle);
  if (onPromptConstructedForLog) onPromptConstructedForLog(constructedPrompt);
  const rawText = await callGeminiAPI(constructedPrompt);
  const parsedResponse = parseGeneratedWorldDetails(rawText);
  return {response: parsedResponse, rawText, constructedPrompt};
};

// NEW: Function to handle world completion
export const generateCompletionForWorldDetails = async (
    currentSettings: WorldSettings,
    onPromptConstructedForLog?: (prompt: string) => void
): Promise<{response: GeneratedWorldElements, rawText: string, constructedPrompt: string}> => {
    const constructedPrompt = PROMPT_FUNCTIONS.completeWorldDetails(
        currentSettings,
        currentSettings.nsfwMode || false,
        currentSettings.genre,
        currentSettings.isCultivationEnabled,
        currentSettings.violenceLevel || DEFAULT_VIOLENCE_LEVEL,
        currentSettings.storyTone || DEFAULT_STORY_TONE,
        currentSettings.customGenreName,
        currentSettings.nsfwDescriptionStyle || DEFAULT_NSFW_DESCRIPTION_STYLE
    );
    if (onPromptConstructedForLog) onPromptConstructedForLog(constructedPrompt);
    const rawText = await callGeminiAPI(constructedPrompt);
    const parsedResponse = parseGeneratedWorldDetails(rawText);
    return { response: parsedResponse, rawText, constructedPrompt };
};

export const generateFanfictionWorldDetails = async (
  sourceMaterial: string, isSourceContent: boolean, playerInputDescription?: string,
  isNsfwIdea?: boolean, genre?: GenreType, isCultivationEnabled?: boolean,
  violenceLevel?: ViolenceLevel, storyTone?: StoryTone, customGenreName?: string,
  nsfwStyle?: NsfwDescriptionStyle, onPromptConstructedForLog?: (prompt: string) => void 
): Promise<{response: GeneratedWorldElements, rawText: string, constructedPrompt: string}> => {
  const constructedPrompt = PROMPT_FUNCTIONS.generateFanfictionWorldDetails(sourceMaterial, isSourceContent, playerInputDescription, isNsfwIdea, genre, isCultivationEnabled, violenceLevel, storyTone, customGenreName, nsfwStyle);
  if (onPromptConstructedForLog) onPromptConstructedForLog(constructedPrompt);
  const rawText = await callGeminiAPI(constructedPrompt);
  const parsedResponse = parseGeneratedWorldDetails(rawText);
  return {response: parsedResponse, rawText, constructedPrompt};
};

export const summarizeTurnHistory = async (
  messagesToSummarize: GameMessage[], worldTheme: string, playerName: string,
  genre?: GenreType, customGenreName?: string, onPromptConstructedForLog?: (prompt: string) => void,
  onSummarizationResponseForLog?: (response: string) => void
): Promise<{ processedSummary: string, rawSummary: string }> => {
  const prompt = PROMPT_FUNCTIONS.summarizePage(messagesToSummarize, worldTheme, playerName, genre, customGenreName);
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
  if(onSummarizationResponseForLog) onSummarizationResponseForLog(rawText);
  return { processedSummary: rawText, rawSummary: rawText };
};

export const countTokens = async (text: string): Promise<number> => {
  const client = getAiClient();
  const { model: configuredModel } = getApiSettings();
  try {
    const response: CountTokensResponse = await client.models.countTokens({ model: configuredModel, contents: text });
    return response.totalTokens;
  } catch (error) {
    console.error("Error counting tokens:", error);
    throw new Error(`Error counting tokens: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateCraftedItemViaAI = async (
  desiredCategory: GameTemplates.ItemCategoryValues,
  requirements: string,
  materials: Array<{ name: string; description: string; category: GameTemplates.ItemCategoryValues; materialType?: GameTemplates.MaterialTypeValues }>,
  playerStats: PlayerStats,
  worldConfig: WorldSettings | null,
  currentPageMessagesLog: string,
  previousPageSummaries: string[],
  lastNarrationFromPreviousPage: string | undefined,
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{response: ParsedAiResponse, rawText: string}> => {
  const prompt = PROMPT_FUNCTIONS.craftItem(desiredCategory, requirements, materials, playerStats, worldConfig, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
  const parsedResponse = parseAiResponseText(rawText);
  return {response: parsedResponse, rawText};
};

export async function generateImageUnified(prompt: string): Promise<string> {
    const settings = getApiSettings();
    const engine = settings.avatarGenerationEngine || DEFAULT_AVATAR_GENERATION_ENGINE;

    switch (engine) {
        case 'gemini-2.0-flash':
            return generateImageWithGemini2Flash(prompt);
        case 'imagen-3.0':
        default:
            return generateImageWithImagen3(prompt);
    }
}

export const parseCombatAiResponse = (responseText: string): ParsedCombatResponse => {
    const narrationParts: string[] = [];
    const choices: AiChoice[] = [];
    const statUpdates: ParsedCombatResponse['statUpdates'] = [];
    let combatEnd: 'victory' | 'defeat' | 'escaped' | 'surrendered' | null = null;

    const allTagsRegex = /\[(.*?)\]/g;
    let match;
    let lastIndex = 0;

    while ((match = allTagsRegex.exec(responseText)) !== null) {
        // Capture text between tags as narration
        const textBeforeTag = responseText.substring(lastIndex, match.index).trim();
        if (textBeforeTag) narrationParts.push(textBeforeTag);
        lastIndex = match.index + match[0].length;

        const content = match[1].trim();
        const colonIndex = content.indexOf(':');
        const tagName = (colonIndex === -1 ? content : content.substring(0, colonIndex)).trim().toUpperCase();
        const tagValue = colonIndex === -1 ? "" : content.substring(colonIndex + 1).trim();

        if (tagName === 'CHOICE') {
            choices.push({ text: tagValue.replace(/^["']|["']$/g, '') });
            continue; // Go to next tag, skip the rest of the loop for this one
        }

        const params = parseTagParams(tagValue);

        switch (tagName) {
            case 'COMBAT_NARRATION':
                narrationParts.push(params.text || tagValue.replace(/^["']|["']$/g, ''));
                break;
            case 'COMBAT_STAT_UPDATE':
                const targetId = params.targetId;
                const stat = params.stat as keyof PlayerStats;
                const change = parseInt(params.change, 10);
                if (targetId && stat && !isNaN(change)) {
                    statUpdates.push({ targetId, stat, change });
                }
                break;
            case 'COMBAT_END':
                const outcome = params.outcome as ParsedCombatResponse['combatEnd'];
                if (outcome && ['victory', 'defeat', 'escaped', 'surrendered'].includes(outcome)) {
                    combatEnd = outcome;
                }
                break;
        }
    }
    // Capture any remaining text after the last tag
    const remainingText = responseText.substring(lastIndex).trim();
    if (remainingText) narrationParts.push(remainingText);

    return {
        narration: narrationParts.join('\n').trim(),
        choices,
        statUpdates,
        combatEnd,
    };
};

export async function generateCombatTurn(
    knowledgeBase: KnowledgeBase,
    playerAction: string,
    combatLog: string[],
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    onPromptConstructed?: (prompt: string) => void
): Promise<{response: ParsedCombatResponse, rawText: string}> {
    const prompt = PROMPT_FUNCTIONS.combatTurn(knowledgeBase, playerAction, combatLog, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
    const rawText = await callGeminiAPI(prompt, onPromptConstructed, { lowLatency: true });
    const response = parseCombatAiResponse(rawText);
    return { response, rawText };
}

export async function summarizeCombat(
    combatLog: string[],
    outcome: 'victory' | 'defeat' | 'escaped' | 'surrendered',
    onPromptConstructed?: (prompt: string) => void
): Promise<string> {
    const prompt = PROMPT_FUNCTIONS.summarizeCombat(combatLog, outcome);
    const rawText = await callGeminiAPI(prompt, onPromptConstructed, { lowLatency: false });
    return rawText.trim();
}

export async function generateDefeatConsequence(
  kb: KnowledgeBase,
  combatResult: CombatEndPayload,
  currentPageMessagesLog: string,
  previousPageSummaries: string[],
  lastNarrationFromPreviousPage: string | undefined,
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{response: ParsedAiResponse, rawText: string}> {
    const prompt = PROMPT_FUNCTIONS.generateDefeatConsequence(kb, combatResult, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
    const parsedResponse = parseAiResponseText(rawText);
    return {response: parsedResponse, rawText};
};

export async function generateVictoryConsequence(
    kb: KnowledgeBase,
    combatResult: CombatEndPayload,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    onPromptConstructedForLog?: (prompt: string) => void
  ): Promise<{response: ParsedAiResponse, rawText: string}> {
      const prompt = PROMPT_FUNCTIONS.generateVictoryConsequence(kb, combatResult, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
      const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
      const parsedResponse = parseAiResponseText(rawText);
      return {response: parsedResponse, rawText};
  };

export async function generateNonCombatDefeatConsequence(
    kb: KnowledgeBase,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    fatalNarration: string,
    lastNarrationFromPreviousPage?: string,
    onPromptConstructedForLog?: (prompt: string) => void
  ): Promise<{response: ParsedAiResponse, rawText: string}> {
      const prompt = PROMPT_FUNCTIONS.generateNonCombatDefeatConsequence(kb, currentPageMessagesLog, previousPageSummaries, fatalNarration, lastNarrationFromPreviousPage);
      const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
      const parsedResponse = parseAiResponseText(rawText);
      return {response: parsedResponse, rawText};
  };


export async function generateCityEconomy(
  city: GameLocation, kb: KnowledgeBase, onPromptConstructedForLog?: (prompt: string) => void,
  onResponseReceivedForLog?: (rawText: string) => void
): Promise<ParsedAiResponse> {
  const prompt = PROMPT_FUNCTIONS.generateEconomyLocations(city, kb);
  const settings = getApiSettings();
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
  if (onResponseReceivedForLog) onResponseReceivedForLog(rawText);
  return parseAiResponseText(rawText);
}

export async function generateGeneralSubLocations(
  mainLocation: GameLocation, kb: KnowledgeBase, onPromptConstructedForLog?: (prompt: string) => void,
  onResponseReceivedForLog?: (rawText: string) => void
): Promise<ParsedAiResponse> {
  const prompt = PROMPT_FUNCTIONS.generateGeneralSubLocations(mainLocation, kb);
  const settings = getApiSettings();
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
  if (onResponseReceivedForLog) onResponseReceivedForLog(rawText);
  return parseAiResponseText(rawText);
}

export async function findLocationWithAI(
    kb: KnowledgeBase, 
    params: FindLocationParams,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse; rawText: string; }> {
    const prompt = PROMPT_FUNCTIONS.findLocation(kb, params, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { lowLatency: false }); // Use a high-quality model for this
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}


export async function generateAuctionData(
  kb: KnowledgeBase, onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse; rawText: string; }> {
  const prompt = PROMPT_FUNCTIONS.generateAuctionData(kb);
  const settings = getApiSettings();
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
  const response = parseAiResponseText(rawText);
  return { response, rawText };
}

export async function runAuctionTurn(
  kb: KnowledgeBase, item: AuctionItem, playerBid: number,
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse; rawText: string; }> {
  const prompt = PROMPT_FUNCTIONS.runAuctionTurn(kb, item, playerBid);
  const settings = getApiSettings();
  const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
  const response = parseAiResponseText(rawText);
  return { response, rawText };
}

export async function runAuctioneerCallPrompt(
  kb: KnowledgeBase, item: AuctionItem, callCount: number,
  onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse; rawText: string; }> {
    const prompt = PROMPT_FUNCTIONS.runAuctioneerCall(kb, item, callCount);
    const settings = getApiSettings();
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}

export async function generateVendorRestock(
    vendor: NPC, kb: KnowledgeBase, onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse; rawText: string; }> {
    const prompt = PROMPT_FUNCTIONS.restockVendor(vendor, kb);
    const settings = getApiSettings();
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}

// --- New Slave Auction Functions ---
export async function generateSlaveAuctionData(
    kb: KnowledgeBase, onPromptConstructedForLog?: (prompt: string) => void
  ): Promise<{ response: ParsedAiResponse; rawText: string; }> {
    const prompt = PROMPT_FUNCTIONS.generateSlaveAuctionData(kb);
    const settings = getApiSettings();
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
    const response = parseAiResponseText(rawText);
    return { response, rawText };
  }
  
  export async function runSlaveAuctionTurn(
    kb: KnowledgeBase, item: AuctionSlave, playerBid: number,
    onPromptConstructedForLog?: (prompt: string) => void
  ): Promise<{ response: ParsedAiResponse; rawText: string; }> {
    const prompt = PROMPT_FUNCTIONS.runSlaveAuctionTurn(kb, item, playerBid);
    const settings = getApiSettings();
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
    const response = parseAiResponseText(rawText);
    return { response, rawText };
  }
  
  export async function runSlaveAuctioneerCall(
    kb: KnowledgeBase, item: AuctionSlave, callCount: number,
    onPromptConstructedForLog?: (prompt: string) => void
  ): Promise<{ response: ParsedAiResponse; rawText: string; }> {
      const prompt = PROMPT_FUNCTIONS.runSlaveAuctioneerCall(kb, item, callCount);
      const settings = getApiSettings();
      const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { model: settings.economyModel, lowLatency: true });
      const response = parseAiResponseText(rawText);
      return { response, rawText };
  }
  
// New cultivation functions
export async function generateCultivationSession(
    kb: KnowledgeBase,
    cultivationType: 'skill' | 'method',
    duration: number,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    skill?: Skill,
    method?: Skill,
    partner?: NPC | Wife | Slave,
    onPromptConstructedForLog?: (prompt: string) => void,
): Promise<{ response: ParsedAiResponse, rawText: string }> {
    const prompt = PROMPT_FUNCTIONS.cultivationSession(kb, cultivationType, duration, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage, skill, method, partner);
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog, { lowLatency: false });
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}

export async function summarizeCultivationSession(log: string[]): Promise<string> {
    const prompt = PROMPT_FUNCTIONS.summarizeCultivation(log);
    const rawText = await callGeminiAPI(prompt, undefined, { lowLatency: false });
    return rawText.trim();
}

// New Companion/Prisoner Interaction Functions
export async function handlePrisonerInteraction(
    kb: KnowledgeBase,
    prisoner: Prisoner,
    action: string,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse, rawText: string }> {
    const prompt = PROMPT_FUNCTIONS.prisonerInteraction(kb, prisoner, action, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}

export async function handleCompanionInteraction(
    kb: KnowledgeBase,
    companion: Wife | Slave,
    action: string,
    currentPageMessagesLog: string,
    previousPageSummaries: string[],
    lastNarrationFromPreviousPage: string | undefined,
    onPromptConstructedForLog?: (prompt: string) => void
): Promise<{ response: ParsedAiResponse, rawText: string }> {
    const prompt = PROMPT_FUNCTIONS.companionInteraction(kb, companion, action, currentPageMessagesLog, previousPageSummaries, lastNarrationFromPreviousPage);
    const rawText = await callGeminiAPI(prompt, onPromptConstructedForLog);
    const response = parseAiResponseText(rawText);
    return { response, rawText };
}

export async function summarizePrisonerInteraction(log: string[]): Promise<string> {
    const prompt = PROMPT_FUNCTIONS.summarizePrisonerInteraction(log);
    const rawText = await callGeminiAPI(prompt, undefined, { lowLatency: false });
    return rawText.trim();
}

export async function summarizeCompanionInteraction(log: string[]): Promise<string> {
    const prompt = PROMPT_FUNCTIONS.summarizeCompanionInteraction(log);
    const rawText = await callGeminiAPI(prompt, undefined, { lowLatency: false });
    return rawText.trim();
}