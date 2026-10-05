// Small lane icons: src/assets/roles/role-<lane>.png. laneIcon('exp') gives the image URL, or undefined for an unknown lane.
const ICONS = import.meta.glob('../../assets/roles/role-*.png', { eager: true, import: 'default' })
export const laneIcon = (lane) => ICONS[`../../assets/roles/role-${lane}.png`]
