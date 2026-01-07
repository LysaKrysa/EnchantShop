export interface Enchantment {
  id: string;
  name: string;
  maxLevel: number;
  description: string;
  category: string;
}

export const enchantments: Enchantment[] = [
  // Armor Enchantments
  { id: 'protection', name: 'Protection', maxLevel: 4, description: 'Reduces most types of damage', category: 'Armor' },
  { id: 'fire_protection', name: 'Fire Protection', maxLevel: 4, description: 'Reduces fire damage and burn time', category: 'Armor' },
  { id: 'blast_protection', name: 'Blast Protection', maxLevel: 4, description: 'Reduces explosion damage', category: 'Armor' },
  { id: 'projectile_protection', name: 'Projectile Protection', maxLevel: 4, description: 'Reduces projectile damage', category: 'Armor' },
  { id: 'thorns', name: 'Thorns', maxLevel: 3, description: 'Damages attackers', category: 'Armor' },
  
  // Helmet Enchantments
  { id: 'respiration', name: 'Respiration', maxLevel: 3, description: 'Extends underwater breathing time', category: 'Helmet' },
  { id: 'aqua_affinity', name: 'Aqua Affinity', maxLevel: 1, description: 'Increases underwater mining speed', category: 'Helmet' },
  
  // Boots Enchantments
  { id: 'feather_falling', name: 'Feather Falling', maxLevel: 4, description: 'Reduces fall damage', category: 'Boots' },
  { id: 'depth_strider', name: 'Depth Strider', maxLevel: 3, description: 'Increases underwater movement speed', category: 'Boots' },
  { id: 'frost_walker', name: 'Frost Walker', maxLevel: 2, description: 'Freezes water beneath the player', category: 'Boots' },
  { id: 'soul_speed', name: 'Soul Speed', maxLevel: 3, description: 'Increases speed on soul sand and soul soil', category: 'Boots' },
  { id: 'swift_sneak', name: 'Swift Sneak', maxLevel: 3, description: 'Increases sneaking speed', category: 'Boots' },
  
  // Sword Enchantments
  { id: 'sharpness', name: 'Sharpness', maxLevel: 5, description: 'Increases damage', category: 'Sword' },
  { id: 'smite', name: 'Smite', maxLevel: 5, description: 'Increases damage to undead mobs', category: 'Sword' },
  { id: 'bane_of_arthropods', name: 'Bane of Arthropods', maxLevel: 5, description: 'Increases damage to arthropods', category: 'Sword' },
  { id: 'knockback', name: 'Knockback', maxLevel: 2, description: 'Increases knockback', category: 'Sword' },
  { id: 'fire_aspect', name: 'Fire Aspect', maxLevel: 2, description: 'Sets target on fire', category: 'Sword' },
  { id: 'looting', name: 'Looting', maxLevel: 3, description: 'Increases mob drops', category: 'Sword' },
  { id: 'sweeping_edge', name: 'Sweeping Edge', maxLevel: 3, description: 'Increases sweeping attack damage', category: 'Sword' },
  
  // Tool Enchantments
  { id: 'efficiency', name: 'Efficiency', maxLevel: 5, description: 'Increases mining speed', category: 'Tools' },
  { id: 'silk_touch', name: 'Silk Touch', maxLevel: 1, description: 'Mined blocks drop themselves', category: 'Tools' },
  { id: 'fortune', name: 'Fortune', maxLevel: 3, description: 'Increases certain block drops', category: 'Tools' },
  
  // Bow Enchantments
  { id: 'power', name: 'Power', maxLevel: 5, description: 'Increases arrow damage', category: 'Bow' },
  { id: 'punch', name: 'Punch', maxLevel: 2, description: 'Increases arrow knockback', category: 'Bow' },
  { id: 'flame', name: 'Flame', maxLevel: 1, description: 'Arrows set target on fire', category: 'Bow' },
  { id: 'infinity', name: 'Infinity', maxLevel: 1, description: 'Shooting consumes no arrows', category: 'Bow' },
  
  // Crossbow Enchantments
  { id: 'multishot', name: 'Multishot', maxLevel: 1, description: 'Shoots 3 arrows at once', category: 'Crossbow' },
  { id: 'piercing', name: 'Piercing', maxLevel: 4, description: 'Arrows pass through entities', category: 'Crossbow' },
  { id: 'quick_charge', name: 'Quick Charge', maxLevel: 3, description: 'Decreases crossbow charging time', category: 'Crossbow' },
  
  // Trident Enchantments
  { id: 'loyalty', name: 'Loyalty', maxLevel: 3, description: 'Trident returns after being thrown', category: 'Trident' },
  { id: 'impaling', name: 'Impaling', maxLevel: 5, description: 'Extra damage to aquatic mobs', category: 'Trident' },
  { id: 'riptide', name: 'Riptide', maxLevel: 3, description: 'Trident launches player in water', category: 'Trident' },
  { id: 'channeling', name: 'Channeling', maxLevel: 1, description: 'Summons lightning on hit during storms', category: 'Trident' },
  
  // Fishing Rod Enchantments
  { id: 'luck_of_the_sea', name: 'Luck of the Sea', maxLevel: 3, description: 'Increases luck while fishing', category: 'Fishing Rod' },
  { id: 'lure', name: 'Lure', maxLevel: 3, description: 'Decreases wait time for fish', category: 'Fishing Rod' },
  
  // Universal Enchantments
  { id: 'unbreaking', name: 'Unbreaking', maxLevel: 3, description: 'Increases item durability', category: 'Universal' },
  { id: 'mending', name: 'Mending', maxLevel: 1, description: 'Repairs item using XP', category: 'Universal' },

];

export const categories = [...new Set(enchantments.map(e => e.category))];
