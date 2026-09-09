// Research preview only; no technology purchase mechanics.
export function renderTechnology() {
  const technologies = [
    ['Skinning', '10 Wood', 'Farmers collect Skins'],
    ['Harvesting', '10 Wood', 'Woodcutters collect Herbs'],
    ['Prospecting', '10 Stone', 'Miners collect Ore'],
    ['Masonry', '100 Wood, 100 Stone', 'Unlocks Village buildings'],
  ];
  return `<div class="unavailable">Research unavailable</div><div class="tech-list">${technologies.map(([name, cost, effect]) => `<div class="tech-card" title="${effect}"><span>${name}</span><span class="cost">${cost}</span></div>`).join('')}</div>`;
}
