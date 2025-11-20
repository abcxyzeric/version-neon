

import { KnowledgeBase, GameMessage } from '../../types';

export const processChangeTime = (
    currentKb: KnowledgeBase,
    tagParams: Record<string, string>,
    turnForSystemMessages: number
): { updatedKb: KnowledgeBase; systemMessages: GameMessage[] } => {
    const newKb = JSON.parse(JSON.stringify(currentKb)) as KnowledgeBase;
    const systemMessages: GameMessage[] = [];

    const daysToAdd = parseInt(tagParams.ngay || "0", 10);
    const monthsToAdd = parseInt(tagParams.thang || "0", 10);
    const yearsToAdd = parseInt(tagParams.nam || "0", 10);

    if (isNaN(daysToAdd) || isNaN(monthsToAdd) || isNaN(yearsToAdd) || (daysToAdd <= 0 && monthsToAdd <= 0 && yearsToAdd <= 0)) {
        console.warn("CHANGE_TIME: Invalid or no time change specified.", tagParams);
        return { updatedKb: newKb, systemMessages };
    }

    let { day, month, year } = newKb.worldDate;

    // --- Start Lifespan Reduction Logic ---
    const totalDaysPassed = (yearsToAdd * 360) + (monthsToAdd * 30) + daysToAdd;
    const yearsPassed = totalDaysPassed / 360.0;
    
    // Player
    if (newKb.playerStats.thoNguyen) {
        newKb.playerStats.thoNguyen -= yearsPassed;
        if (newKb.playerStats.thoNguyen <= 0) {
            newKb.playerStats.thoNguyen = 0;
            // Game over logic could be triggered from this message
            systemMessages.push({
                id: `player-lifespan-depleted-${Date.now()}`,
                type: 'error',
                content: `Thọ nguyên đã cạn! Sinh mệnh của bạn đã đến hồi kết.`,
                timestamp: Date.now(),
                turnNumber: turnForSystemMessages
            });
        }
    }

    // NPCs
    newKb.discoveredNPCs = newKb.discoveredNPCs.filter(npc => {
        if (npc.stats?.thoNguyen !== undefined) {
            npc.stats.thoNguyen -= yearsPassed;
            if (npc.stats.thoNguyen <= 0) {
                systemMessages.push({
                    id: `npc-lifespan-depleted-${npc.id}`,
                    type: 'system',
                    content: `Do thọ nguyên đã hết, ${npc.name} đã qua đời.`,
                    timestamp: Date.now(),
                    turnNumber: turnForSystemMessages
                });
                return false; // Remove from list
            }
        }
        return true;
    });

    // Wives
    newKb.wives = newKb.wives.filter(wife => {
        if (wife.stats?.thoNguyen !== undefined) {
            wife.stats.thoNguyen -= yearsPassed;
            if (wife.stats.thoNguyen <= 0) {
                systemMessages.push({
                    id: `wife-lifespan-depleted-${wife.id}`,
                    type: 'system',
                    content: `Do thọ nguyên đã hết, đạo lữ của bạn là ${wife.name} đã qua đời.`,
                    timestamp: Date.now(),
                    turnNumber: turnForSystemMessages
                });
                return false;
            }
        }
        return true;
    });

    // Slaves
    newKb.slaves = newKb.slaves.filter(slave => {
        if (slave.stats?.thoNguyen !== undefined) {
            slave.stats.thoNguyen -= yearsPassed;
            if (slave.stats.thoNguyen <= 0) {
                systemMessages.push({
                    id: `slave-lifespan-depleted-${slave.id}`,
                    type: 'system',
                    content: `Do thọ nguyên đã hết, nô lệ của bạn là ${slave.name} đã qua đời.`,
                    timestamp: Date.now(),
                    turnNumber: turnForSystemMessages
                });
                return false;
            }
        }
        return true;
    });

    // Prisoners
    newKb.prisoners = newKb.prisoners.filter(prisoner => {
        if (prisoner.stats?.thoNguyen !== undefined) {
            prisoner.stats.thoNguyen -= yearsPassed;
            if (prisoner.stats.thoNguyen <= 0) {
                systemMessages.push({
                    id: `prisoner-lifespan-depleted-${prisoner.id}`,
                    type: 'system',
                    content: `Do thọ nguyên đã hết, tù nhân ${prisoner.name} đã chết trong ngục.`,
                    timestamp: Date.now(),
                    turnNumber: turnForSystemMessages
                });
                return false;
            }
        }
        return true;
    });
    // --- End Lifespan Reduction Logic ---


    // Add years and months first
    year += yearsToAdd;
    month += monthsToAdd;

    // Add days
    day += daysToAdd;

    // Normalize months and years from day overflow
    if (day > 30) {
        const extraMonths = Math.floor((day - 1) / 30);
        month += extraMonths;
        day = ((day - 1) % 30) + 1;
    }

    // Normalize years from month overflow
    if (month > 12) {
        const extraYears = Math.floor((month - 1) / 12);
        year += extraYears;
        month = ((month - 1) % 12) + 1;
    }
    
    // Format the passed duration for the system message
    let displayYears = yearsToAdd;
    let displayMonths = monthsToAdd;
    let displayDays = daysToAdd;

    if (displayDays >= 30) {
        displayMonths += Math.floor(displayDays / 30);
        displayDays %= 30;
    }

    if (displayMonths >= 12) {
        displayYears += Math.floor(displayMonths / 12);
        displayMonths %= 12;
    }
    
    const timePassedParts: string[] = [];
    if (displayYears > 0) timePassedParts.push(`${displayYears} năm`);
    if (displayMonths > 0) timePassedParts.push(`${displayMonths} tháng`);
    if (displayDays > 0) timePassedParts.push(`${displayDays} ngày`);
    
    const timePassedMessage = timePassedParts.length > 0 ? timePassedParts.join(', ') : 'không đáng kể';

    systemMessages.push({
        id: `time-changed-${Date.now()}`,
        type: 'system',
        content: `Thời gian đã trôi qua: ${timePassedMessage}.`,
        timestamp: Date.now(),
        turnNumber: turnForSystemMessages
    });

    newKb.worldDate = { day, month, year };

    return { updatedKb: newKb, systemMessages };
};