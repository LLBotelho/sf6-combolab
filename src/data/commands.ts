import type { ComboCategory, ComboTag, CommandDefinition, CommandGroup } from '../types';

const img = (name: string) => `${import.meta.env.BASE_URL}assets/commands/${name}.png`;

export const categories: ComboCategory[] = [
  'Low combos', 'Basic combos', 'Punish combos', 'Counter combos',
  'Corner combos', 'Drive impact combos', 'Drive rush combos',
  'Overdrive combos', 'Super Art combos',
];
export const tags: ComboTag[] = ['Maior Dano', 'Mais Fácil', 'Favorito'];

export const commandGroups: Array<{ key: CommandGroup; label: string }> = [
  { key: 'direction', label: 'Direções' }, { key: 'motion', label: 'Movimentos' },
  { key: 'attack', label: 'Ataques' }, { key: 'system', label: 'Sistema' },
  { key: 'separator', label: 'Conectores' },
];

export const commands: CommandDefinition[] = [
  {key:'forward', label:'Frente',subtitle:'→ / 6',group:'direction',image:img('forward')},
  {key:'back', label:'Trás',subtitle:'← / 4',group:'direction',image:img('back')},
  {key:'down', label:'Baixo',subtitle:'↓ / 2',group:'direction',image:img('down')},
  {key:'up', label:'Cima',subtitle:'↑ / 8',group:'direction',image:img('up')},
  {key:'down-forward', label:'Baixo + frente',subtitle:'↘ / 3',group:'direction',image:img('down-forward')},
  {key:'down-back', label:'Baixo + trás',subtitle:'↙ / 1',group:'direction',image:img('down-back')},
  {key:'up-forward', label:'Cima + frente',subtitle:'↗ / 9',group:'direction',image:img('up-forward')},
  {key:'up-back', label:'Cima + trás',subtitle:'↖ / 7',group:'direction',image:img('up-back')},
  {key:'qcf', label:'Quarter Circle Forward',subtitle:'236 / ↓↘→',group:'motion',image:img('qcf')},
  {key:'qcb', label:'Quarter Circle Back',subtitle:'214 / ↓↙←',group:'motion',image:img('qcb')},
  {key:'dp', label:'Dragon Punch Forward',subtitle:'623 / →↓↘',group:'motion',image:img('dp')},
  {key:'dp-back', label:'Dragon Punch Back',subtitle:'421 / ←↓↙',group:'motion',image:img('dp'),mirrored:true},
  {key:'hcb', label:'Half Circle Back',subtitle:'63214 / →↘↓↙←',group:'motion',image:img('hcb')},
  {key:'hcf', label:'Half Circle Forward',subtitle:'41236 / ←↙↓↘→',group:'motion',image:img('hcb'),mirrored:true},
  {key:'double-qcf', label:'Double Quarter Circle Forward',subtitle:'236236',group:'motion',text:'↓↘→  ↓↘→'},
  {key:'double-qcb', label:'Double Quarter Circle Back',subtitle:'214214',group:'motion',text:'↓↙←  ↓↙←'},
  {key:'charge-back', label:'Charge Back → Forward',subtitle:'[4]6',group:'motion',text:'[←] →'},
  {key:'charge-down', label:'Charge Down → Up',subtitle:'[2]8',group:'motion',text:'[↓] ↑'},
  {key:'lp', label:'Light Punch',subtitle:'LP',group:'attack',image:img('lp')},
  {key:'mp', label:'Medium Punch',subtitle:'MP',group:'attack',image:img('mp')},
  {key:'hp', label:'Heavy Punch',subtitle:'HP',group:'attack',image:img('hp')},
  {key:'lk', label:'Light Kick',subtitle:'LK',group:'attack',image:img('lk')},
  {key:'mk', label:'Medium Kick',subtitle:'MK',group:'attack',image:img('mk')},
  {key:'hk', label:'Heavy Kick',subtitle:'HK',group:'attack',image:img('hk')},
  {key:'pp', label:'Dois socos simultâneos',subtitle:'PP / OD*',group:'attack',image:img('pp')},
  {key:'kk', label:'Dois chutes simultâneos',subtitle:'KK / OD*',group:'attack',image:img('kk')},
  {key:'drive-impact', label:'Drive Impact',subtitle:'HP + HK',group:'system',text:'DI'},
  {key:'drive-parry', label:'Drive Parry',subtitle:'MP + MK',group:'system',text:'PARRY'},
  {key:'drive-rush', label:'Drive Rush',subtitle:'DR',group:'system',text:'DR'},
  {key:'overdrive', label:'Overdrive',subtitle:'OD',group:'system',text:'OD'},
  {key:'sa1', label:'Super Art 1',subtitle:'SA1',group:'system',text:'SA 1'},
  {key:'sa2', label:'Super Art 2',subtitle:'SA2',group:'system',text:'SA 2'},
  {key:'sa3', label:'Super Art 3',subtitle:'SA3',group:'system',text:'SA 3'},
  {key:'link', label:'Próximo golpe',subtitle:'Conexão',group:'separator',image:img('link')},
  {key:'plus', label:'Pressionamento simultâneo',subtitle:'+',group:'separator',image:img('plus')},
  {key:'cancel', label:'Cancelamento',subtitle:'xx',group:'separator',text:'xx'},
  {key:'wait', label:'Pausa / Delay',subtitle:'...',group:'separator',text:'…'},
];

export const commandMap = new Map(commands.map((c) => [c.key, c]));
