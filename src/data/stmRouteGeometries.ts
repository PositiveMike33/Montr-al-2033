// STM Bus Lines Detailed Geometries and Waypoints for Tactical Map Visualization
export interface STMStop {
  id: string;
  name: string;
  coords: [number, number];
  direction?: string;
  isTerminal?: boolean;
  connections?: string[];
}

export interface STMRouteGeometry {
  routeId: string;
  routeName: string;
  shortLabel: string;
  corridor: string;
  color: string;
  accentColor: string;
  description: string;
  path: [number, number][];
  keyStops: STMStop[];
  stats: {
    lengthKm: number;
    avgSpeedKmh: number;
    frequencyMin: number;
    fleetType: string;
  };
}

export const STM_ROUTE_GEOMETRIES: Record<string, STMRouteGeometry> = {
  '24': {
    routeId: '24',
    routeName: 'Ligne 24 - Sherbrooke',
    shortLabel: '24 Sherbrooke',
    corridor: 'Axe Ouest-Est Sherbrooke / Westmount / Centre-Ville / Hochelaga',
    color: '#38bdf8',
    accentColor: '#0284c7',
    description: 'Artère culturelle et universitaire de Montréal. Traverse le Mille Carré Doré, le campus McGill, la Place-des-Arts et le Plateau.',
    path: [
      [45.4740, -73.6040], // Station Vendôme
      [45.4765, -73.6120],
      [45.4795, -73.6198], // Villa-Maria
      [45.4830, -73.6010], // Westmount / Victoria
      [45.4855, -73.5935], // Sherbrooke / Greene
      [45.4885, -73.5890], // Station Atwater / Cabot Square
      [45.4930, -73.5830], // Musée des Beaux-Arts Ouest
      [45.4980, -73.5790], // Guy-Concordia / Sherbrooke
      [45.5015, -73.5760], // Peel / Sherbrooke (Ritz-Carlton)
      [45.5042, -73.5740], // McGill Campus / Roddick Gates
      [45.5065, -73.5720], // Place-des-Arts Nord
      [45.5098, -73.5695], // Saint-Urbain
      [45.5125, -73.5680], // Boulevard Saint-Laurent
      [45.5155, -73.5670], // Saint-Denis / Carré Saint-Louis
      [45.5175, -73.5660], // Sherbrooke / Saint-Denis
      [45.5200, -73.5650], // Institut de Tourisme
      [45.5240, -73.5620], // Parc La Fontaine
      [45.5290, -73.5580], // Papineau / Sherbrooke
      [45.5340, -73.5540], // De Lorimier / Sherbrooke
      [45.5380, -73.5510]  // Station Frontenac
    ],
    keyStops: [
      { id: 'stop_24_vendome', name: 'Gare / Métro Vendôme', coords: [45.4740, -73.6040], isTerminal: true, connections: ['Métro Orange', 'Train EXO'] },
      { id: 'stop_24_atwater', name: 'Sherbrooke / Atwater', coords: [45.4885, -73.5890], connections: ['Métro Vert (Atwater)'] },
      { id: 'stop_24_guy', name: 'Sherbrooke / Guy-Concordia', coords: [45.4980, -73.5790], connections: ['Métro Vert', 'Univ. Concordia'] },
      { id: 'stop_24_mcgill', name: 'Sherbrooke / McGill (Portail)', coords: [45.5042, -73.5740], connections: ['Campus McGill', 'RÉSO'] },
      { id: 'stop_24_stlaurent', name: 'Sherbrooke / Saint-Laurent', coords: [45.5125, -73.5680], connections: ['Bus 55 Saint-Laurent'] },
      { id: 'stop_24_lafontaine', name: 'Sherbrooke / Parc La Fontaine', coords: [45.5240, -73.5620], connections: ['Plateau Mont-Royal'] },
      { id: 'stop_24_frontenac', name: 'Station Métro Frontenac', coords: [45.5380, -73.5510], isTerminal: true, connections: ['Métro Vert'] }
    ],
    stats: { lengthKm: 11.2, avgSpeedKmh: 19.5, frequencyMin: 8, fleetType: 'NovaBus LFS Hybride' }
  },

  '136': {
    routeId: '136',
    routeName: 'Ligne 136 - Viau',
    shortLabel: '136 Viau',
    corridor: 'Axe Nord-Sud Viau / Port de Montréal / Parc Olympique / St-Léonard',
    color: '#00ff41',
    accentColor: '#16a34a',
    description: 'Axe industriel et olympique reliant le fleuve Saint-Laurent à Rivière-des-Prairies via le Stade Olympique et le Jardin Botanique.',
    path: [
      [45.5450, -73.5350], // Notre-Dame / Voie maritime
      [45.5530, -73.5410], // Rue Sainte-Catherine Est / Viau
      [45.5580, -73.5450], // Hochelaga / Viau
      [45.5615, -73.5470], // Station Métro Viau
      [45.5645, -73.5510], // Biodôme / Planétarium
      [45.5684, -73.5550], // Jardin Botanique / Parc Maisonneuve
      [45.5740, -73.5620], // Rue Rosemont / Viau
      [45.5810, -73.5700], // Rue Beaubien Est / Viau
      [45.5870, -73.5750], // Rue Bélanger / Viau
      [45.5925, -73.5790], // Rue Jean-Talon Est / Viau
      [45.5990, -73.5830], // Rue Jarry Est / Viau
      [45.6060, -73.5890], // Blvd Grandes-Prairies / Saint-Léonard
      [45.6140, -73.5960], // Rue Bombardier / Zone Logistique
      [45.6210, -73.6020], // Rue Maurice-Duplessis
      [45.6280, -73.6080]  // Terminus Gouin / Rivière-des-Prairies
    ],
    keyStops: [
      { id: 'stop_136_port', name: 'Port de Montréal / Notre-Dame', coords: [45.5450, -73.5350], isTerminal: true, connections: ['Fret Portuaire'] },
      { id: 'stop_136_viau_metro', name: 'Station Métro Viau (Stade)', coords: [45.5615, -73.5470], connections: ['Métro Vert', 'Parc Olympique'] },
      { id: 'stop_136_botanique', name: 'Viau / Jardin Botanique', coords: [45.5684, -73.5550], connections: ['Biodôme / Espace Vie'] },
      { id: 'stop_136_rosemont', name: 'Viau / Rosemont', coords: [45.5740, -73.5620], connections: ['Bus 197 Rosemont'] },
      { id: 'stop_136_jeantalon', name: 'Viau / Jean-Talon Est', coords: [45.5925, -73.5790], connections: ['Bus 141 Jean-Talon', 'Ligne Bleue (Ext.)'] },
      { id: 'stop_136_gouin', name: 'Terminus Gouin / RDP', coords: [45.6280, -73.6080], isTerminal: true, connections: ['Rivière-des-Prairies'] }
    ],
    stats: { lengthKm: 14.8, avgSpeedKmh: 24.2, frequencyMin: 10, fleetType: 'NovaBus Électrique 100%' }
  },

  '55': {
    routeId: '55',
    routeName: 'Ligne 55 - Boulevard Saint-Laurent',
    shortLabel: '55 St-Laurent',
    corridor: 'Axe Central "La Main" / Vieux-Port / Quartier Chinois / Mile End / Ahuntsic',
    color: '#e11d48',
    accentColor: '#be123c',
    description: 'La colonne vertébrale culturelle de Montréal divisant la ville entre Est et Ouest. Traverse le Quartier Chinois, Mile End et la Petite Italie.',
    path: [
      [45.5030, -73.5545], // Vieux-Port / Saint-Paul
      [45.5064, -73.5597], // Champ-de-Mars / Palais de Justice
      [45.5085, -73.5615], // Quartier Chinois (Poste SPVM-Prime)
      [45.5115, -73.5645], // Sainte-Catherine (Quartier des Spectacles)
      [45.5150, -73.5680], // Sherbrooke / Saint-Laurent
      [45.5190, -73.5740], // Avenue des Pins / Prince-Arthur
      [45.5225, -73.5820], // Avenue du Mont-Royal / Saint-Laurent
      [45.5255, -73.5890], // Avenue Laurier
      [45.5280, -73.5970], // Mile End (Saint-Viateur / Fairmont)
      [45.5315, -73.6030], // Boulevard Saint-Joseph
      [45.5350, -73.6100], // Rue Beaubien
      [45.5398, -73.6180], // Rue Jean-Talon / Petite-Italie
      [45.5450, -73.6300], // Rue Jarry / Parc Jarry
      [45.5510, -73.6480], // Boulevard Crémazie
      [45.5580, -73.6650]  // Terminus Métro Henri-Bourassa
    ],
    keyStops: [
      { id: 'stop_55_vieuxport', name: 'Vieux-Port / Saint-Jacques', coords: [45.5030, -73.5545], isTerminal: true, connections: ['Voie maritime'] },
      { id: 'stop_55_chinatown', name: 'Saint-Laurent / Quartier Chinois', coords: [45.5085, -73.5615], connections: ['Poste SPVM-Prime', 'Palais Congrès'] },
      { id: 'stop_55_spectacles', name: 'Saint-Laurent / Ste-Catherine', coords: [45.5115, -73.5645], connections: ['Quartier des Spectacles', 'Métro St-Laurent'] },
      { id: 'stop_55_montroyal', name: 'Saint-Laurent / Mont-Royal', coords: [45.5225, -73.5820], connections: ['Plateau Mont-Royal'] },
      { id: 'stop_55_mileend', name: 'Saint-Laurent / Saint-Viateur', coords: [45.5280, -73.5970], connections: ['Pôle Tech Ubisoft / Mile End'] },
      { id: 'stop_55_petiteitalie', name: 'Saint-Laurent / Jean-Talon', coords: [45.5398, -73.6180], connections: ['Métro De Castelnau', 'Marché Jean-Talon'] },
      { id: 'stop_55_henribourassa', name: 'Terminus Henri-Bourassa', coords: [45.5580, -73.6650], isTerminal: true, connections: ['Métro Orange', 'STL Laval'] }
    ],
    stats: { lengthKm: 12.5, avgSpeedKmh: 17.8, frequencyMin: 9, fleetType: 'NovaBus LFS Hybride' }
  },

  '15': {
    routeId: '15',
    routeName: 'Ligne 15 - Sainte-Catherine',
    shortLabel: '15 Ste-Catherine',
    corridor: 'Axe Commercial & Cybernétique / Atwater / Place Ville-Marie / Village',
    color: '#f59e0b',
    accentColor: '#d97706',
    description: 'La rue commerciale la plus animée du Canada, doublant la ligne verte en surface sous les enseignes néon et tours corpos.',
    path: [
      [45.4895, -73.5840], // Station Atwater / Westmount
      [45.4940, -73.5800], // Guy-Concordia
      [45.4975, -73.5760], // Bishop / Crescent
      [45.5008, -73.5730], // Rue Peel
      [45.5041, -73.5700], // Place Ville-Marie / Robert-Bourassa
      [45.5075, -73.5665], // Place des Arts / Complexe Desjardins
      [45.5115, -73.5630], // Saint-Laurent
      [45.5152, -73.5590], // Station Berri-UQAM
      [45.5195, -73.5545], // Station Beaudry (Le Village)
      [45.5238, -73.5510]  // Station Papineau
    ],
    keyStops: [
      { id: 'stop_15_atwater', name: 'Terminus Métro Atwater', coords: [45.4895, -73.5840], isTerminal: true, connections: ['Métro Vert', 'Alexis Nihon'] },
      { id: 'stop_15_guy', name: 'Ste-Catherine / Guy', coords: [45.4940, -73.5800], connections: ['Univ. Concordia'] },
      { id: 'stop_15_peel', name: 'Ste-Catherine / Peel', coords: [45.5008, -73.5730], connections: ['Tour CIBC / Vance'] },
      { id: 'stop_15_pvm', name: 'Ste-Catherine / Robert-Bourassa', coords: [45.5041, -73.5700], connections: ['Place Ville-Marie', 'RÉSO'] },
      { id: 'stop_15_berri', name: 'Ste-Catherine / Berri-UQAM', coords: [45.5152, -73.5590], connections: ['Pôle Métro Berri (4 Lignes)'] },
      { id: 'stop_15_papineau', name: 'Terminus Métro Papineau', coords: [45.5238, -73.5510], isTerminal: true, connections: ['Pont Jacques-Cartier'] }
    ],
    stats: { lengthKm: 6.4, avgSpeedKmh: 14.5, frequencyMin: 7, fleetType: 'NovaBus Électrique Urbain' }
  },

  '106': {
    routeId: '106',
    routeName: 'Ligne 106 - Newman',
    shortLabel: '106 Newman',
    corridor: 'Axe Sud-Ouest / Métro Angrignon / LaSalle / Terminus Lafleur',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    description: 'Liaison stratégique du Sud-Ouest reliant le pôle intermodal Angrignon aux zones industrielles et résidentielles de LaSalle.',
    path: [
      [45.4464, -73.6033], // Terminus Métro Angrignon
      [45.4430, -73.6120], // Parc Angrignon
      [45.4400, -73.6200], // Carrefour Angrignon
      [45.4370, -73.6310], // Boulevard Newman / Rue Senkus
      [45.4340, -73.6420], // Boulevard Newman / Rue Cordner
      [45.4310, -73.6530], // Boulevard Newman / Rue Dollard
      [45.4280, -73.6640], // Boulevard Newman / Rue Lapierre
      [45.4250, -73.6730]  // Terminus Lafleur / Fleuve Saint-Laurent
    ],
    keyStops: [
      { id: 'stop_106_angrignon', name: 'Terminus Métro Angrignon', coords: [45.4464, -73.6033], isTerminal: true, connections: ['Métro Vert', 'Exo Sud-Ouest'] },
      { id: 'stop_106_carrefour', name: 'Carrefour Angrignon', coords: [45.4400, -73.6200], connections: ['Centre Commercial'] },
      { id: 'stop_106_dollard', name: 'Newman / Dollard', coords: [45.4310, -73.6530], connections: ['LaSalle Centre'] },
      { id: 'stop_106_cegep', name: 'Newman / Cégep Laurendeau', coords: [45.4280, -73.6640], connections: ['Cégep André-Laurendeau'] },
      { id: 'stop_106_lafleur', name: 'Terminus Newman / Lafleur', coords: [45.4250, -73.6730], isTerminal: true, connections: ['Rapides de Lachine'] }
    ],
    stats: { lengthKm: 7.8, avgSpeedKmh: 26.5, frequencyMin: 12, fleetType: 'NovaBus LFS Diesel-Électrique' }
  },

  '139': {
    routeId: '139',
    routeName: 'Ligne 139 - Pie-IX (SRB)',
    shortLabel: '139 Pie-IX SRB',
    corridor: 'Axe Rapide SRB Pie-IX / Stade Olympique / Laval / Pont Pie-IX',
    color: '#06b6d4',
    accentColor: '#0891b2',
    description: 'Service Rapide par Bus (SRB) en site propre protégé. Voie rapide ultra-cadencée traversant l\'est de Montréal vers Laval.',
    path: [
      [45.5420, -73.5350], // Terminus Notre-Dame / Bassin Portuaire
      [45.5490, -73.5440], // Rue Sainte-Catherine Est
      [45.5538, -73.5515], // Station Métro Pie-IX
      [45.5580, -73.5560], // Stade Olympique / Mât incliné
      [45.5650, -73.5640], // Rue Rosemont / SRB Station
      [45.5720, -73.5720], // Rue Beaubien Est
      [45.5780, -73.5780], // Rue Bélanger
      [45.5850, -73.5850], // Rue Jean-Talon Est (Station SRB Jean-Talon)
      [45.5920, -73.5920], // Rue Jarry Est
      [45.6020, -73.6030], // Boulevard Robert
      [45.6130, -73.6150], // Boulevard Henri-Bourassa Est
      [45.6240, -73.6260]  // Boulevard Gouin / Pont Pie-IX vers Laval
    ],
    keyStops: [
      { id: 'stop_139_notredame', name: 'Terminus Notre-Dame', coords: [45.5420, -73.5350], isTerminal: true, connections: ['Port de Montréal'] },
      { id: 'stop_139_pieix_metro', name: 'Station Métro Pie-IX (Stade)', coords: [45.5538, -73.5515], connections: ['Métro Vert', 'Parc Olympique'] },
      { id: 'stop_139_rosemont', name: 'Station SRB Rosemont', coords: [45.5650, -73.5640], connections: ['Voie Rapide SRB'] },
      { id: 'stop_139_jeantalon', name: 'Station SRB Jean-Talon', coords: [45.5850, -73.5850], connections: ['Ligne Bleue (Prolongement)'] },
      { id: 'stop_139_henribourassa', name: 'Station SRB Henri-Bourassa', coords: [45.6130, -73.6150], connections: ['Gare St-Michel-Montréal-Nord'] },
      { id: 'stop_139_pontpieix', name: 'Terminus Pont Pie-IX (Laval)', coords: [45.6240, -73.6260], isTerminal: true, connections: ['Pont Pie-IX', 'STL STLaval'] }
    ],
    stats: { lengthKm: 13.9, avgSpeedKmh: 31.0, frequencyMin: 5, fleetType: 'NovaBus Articulé 18m Hybride' }
  },

  '747': {
    routeId: '747',
    routeName: 'Ligne 747 - YUL Aéroport / Centre-Ville',
    shortLabel: '747 YUL Express',
    corridor: 'Axe Autoroutier Express 24/7 / Aéroport Trudeau / Échangeur Turcot / Bonaventure',
    color: '#10b981',
    accentColor: '#059669',
    description: 'Navette express 24h/24 reliant l\'aéroport international YUL au centre-ville d\'affaires et aux hôtels de prestige de Vance Holdings.',
    path: [
      [45.4575, -73.7495], // Aéroport Montréal-Trudeau (YUL) Terminal
      [45.4540, -73.7200], // Autoroute 20 Ouest / Dorval
      [45.4490, -73.6800], // Autoroute 20 / Boulevard Montréal-Toronto
      [45.4520, -73.6500], // Échangeur Saint-Pierre
      [45.4600, -73.6200], // Falaise Saint-Jacques
      [45.4650, -73.6050], // Échangeur Turcot Cyber-Hub
      [45.4740, -73.5900], // Rue Saint-Jacques
      [45.4828, -73.5798], // Station Métro Lionel-Groulx
      [45.4910, -73.5750], // Rue Guy / René-Lévesque
      [45.4984, -73.5667], // Station Bonaventure / Centre Bell
      [45.5020, -73.5630], // René-Lévesque / Union
      [45.5080, -73.5580], // René-Lévesque / Saint-Laurent
      [45.5152, -73.5611]  // Gare d'autocars de Montréal / Berri-UQAM
    ],
    keyStops: [
      { id: 'stop_747_yul', name: 'Aéroport YUL Terminal International', coords: [45.4575, -73.7495], isTerminal: true, connections: ['Aérogare YUL', 'Vols Orbitaux'] },
      { id: 'stop_747_lionelgroulx', name: 'Station Métro Lionel-Groulx', coords: [45.4828, -73.5798], connections: ['Métro Vert', 'Métro Orange'] },
      { id: 'stop_747_guy', name: 'René-Lévesque / Guy', coords: [45.4910, -73.5750], connections: ['Centre Bell Sud'] },
      { id: 'stop_747_bonaventure', name: 'Station Bonaventure / Vance Hub', coords: [45.4984, -73.5667], connections: ['Gare Centrale', 'REM', 'Métro Orange'] },
      { id: 'stop_747_berri', name: 'Gare d\'autocars / Berri-UQAM', coords: [45.5152, -73.5611], isTerminal: true, connections: ['Liaisons Régionales', '4 Lignes Métro'] }
    ],
    stats: { lengthKm: 20.4, avgSpeedKmh: 42.0, frequencyMin: 10, fleetType: 'NovaBus Navette Wi-Fi Bagages' }
  }
};
