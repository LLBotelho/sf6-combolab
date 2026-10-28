import type { Fighter } from '../types';

// Editable starter catalog. Portrait artwork exists only for E. Honda in the supplied materials.
const entries: Array<[string, string, string, string, boolean?]> = [
  ['ryu','Ryu','THE SEEKER','#d34245'],
  ['luke','Luke','RISING STAR','#e8a43d'],
  ['jamie','Jamie','THE BREAKDANCER','#b566e8'],
  ['chun-li','Chun-Li','LEGENDARY KICKS','#3aabcf'],
  ['guile','Guile','SONIC BOOM','#87c4a5'],
  ['kimberly','Kimberly','NINJA SPIRIT','#e78065'],
  ['juri','Juri','SPIDER LILY','#aa59dc'],
  ['ken','Ken','THE DRAGON','#ff5b51'],
  ['e-honda','E. Honda','SUMO SPIRIT','#d85867',true],
  ['dhalsim','Dhalsim','YOGA MASTER','#daa959'],
  ['blanka','Blanka','WILD ELECTRIC','#80bc58'],
  ['manon','Manon','GRACE & POWER','#c695b5'],
  ['marisa','Marisa','GLADIATOR','#b9645c'],
  ['lily','Lily','WINDS OF CHANGE','#c6ad62'],
  ['jp','JP','THE MYSTERY','#8d74c7'],
  ['dee-jay','Dee Jay','RHYTHM & FIRE','#f2c94c'],
  ['cammy','Cammy','DELTA RED','#99ae5b'],
  ['zangief','Zangief','THE IRON CYCLONE','#c66555'],
  ['rashid','Rashid','TURBULENT WIND','#64c1c1'],
  ['aki','A.K.I.','DEADLY POISON','#8b76d4'],
  ['ed','Ed','PSYCHO POWER','#8e92cf'],
  ['akuma','Akuma','THE DEMON','#c64f55'],
  ['m-bison','M. Bison','DARK POWER','#8b57b4'],
  ['terry','Terry','FATAL FURY','#dc7357'],
  ['mai','Mai','SHIRANUI FLAME','#d45b67'],
  ['elena','Elena','CAPOEIRA SPIRIT','#77bba2'],
  ['sagat','Sagat','THE EMPEROR','#cf9b63'],
  ['c-viper','C. Viper','UNDERCOVER AGENT','#ae5a68'],
  ['alex','Alex','THE WRESTLER','#83b095'],
  ['ingrid','Ingrid','SUN GODDESS','#d5bb86'],
  ['yasmine','Yasmine','NEW CHALLENGER','#cd8bc9'],
  ['arjun','Arjun','NEW CHALLENGER','#9baec8'],
];

export const fighters: Fighter[] = entries.map(([id, name, title, hue, isReferenceArt]) => ({
  id, name, title, hue, isReferenceArt,
  abbreviation: name.replace(/[^A-Za-z]/g,'').slice(0, 2).toUpperCase(),
}));

export const getFighter = (id: string) => fighters.find((fighter) => fighter.id === id);
