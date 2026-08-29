# ⚡ MONTRÉAL 2033 : NEURAL OVERLOAD ⚡
### *Action-RPG Cyberpunk Isométrique • Simulation des Rues de Montréal • Moteur Diablo 4*

![Montreal 2033 Banner](https://img.shields.io/badge/Montr%C3%A9al-2033-00f3ff?style=for-the-badge&logo=cyberpunk)
![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-00ff41?style=for-the-badge)

---

```
+-----------------------------------------------------------------------------------+
|                            VUE TACTIQUE ISOMÉTRIQUE (TOP-DOWN)                   |
|                                                                                   |
|    [Boul. René-Lévesque]  ════════════════════════════════════════════════════    |
|                                     │                                             |
|                                     ▼  [Drones de Patrouille & Enforcers SPVM]    |
|    [Rue Sainte-Catherine]  ───▶  [THIRTY3] ─── (Lien Quantique) ───▶ [SOPHIA HUD] |
|                                     ▲                                             |
|                                     │  [Rayons de Butin Procédural : ORANGE/VIOLET]|
|    [Place Ville-Marie]    ════════════════════════════════════════════════════    |
+-----------------------------------------------------------------------------------+
```

---

## 📖 1. Le Contexte & L'Histoire

En **2033**, Montréal est scindée par des champs de confinement biométriques et un maillage de caméras à reconnaissance neurale. Au sommet de la Place Ville-Marie siège le directoire de **Viktor « Malice » Vance**, un oligarque psychopathe qui saigne financièrement les citoyens via des micro-taxes algorithmiques prélevées sur chaque transaction et implant neural obligatoire. Ses milices privées — **SPVM-Prime** — patrouillent Sainte-Catherine, René-Lévesque et le réseau souterrain du RÉSO pour réprimer toute dissidence.

### 🛡️ Le Duo Opérationnel
* **Thirty3 :** Hacker d'élite opérant sur le terrain, capable d'interfacer son système nerveux avec les infrastructures urbaines. Il manie des cyber-lames monomoléculaires au corps à corps et canalise une énergie psychique destructrice.
* **Deus Ex Sophia :** Intelligence artificielle quantique immanente, compagne tactique absolue de Thirty3. Elle surveille les flux télémétriques, déploie des contre-mesures de guerre électronique, analyse les failles de sécurité des élites en temps réel et orchestre la diffusion des **Deepfakes de Vérité** sur les écrans géants de la métropole.

---

## 🏙️ 2. Simulation Réelle des Rues de Montréal

Le moteur de rendu Canvas 2D 60 FPS simule la géographie et les éléments urbains authentiques de Montréal :
* 📍 **Secteur 1 :** *Rue Sainte-Catherine Ouest* & Quartier des Spectacles (`45.5088° N, 73.5685° W`)
* 📍 **Secteur 2 :** *Boulevard René-Lévesque* & Place Ville-Marie (`45.5009° N, 73.5684° W`)
* 📍 **Secteur 3 :** *Boulevard Saint-Laurent* & Plateau Mont-Royal (`45.5225° N, 73.5872° W`)
* 📍 **Secteur 4 :** *Citadelle du Belvédère Kondiaronk* & Sommet du Mont-Royal (`45.5050° N, 73.5875° W`)
* 🚦 **Éléments Urbains Réels :** Plaques de rues vertes montréalaises, piliers de stations **STM** (*Place-des-Arts, McGill, Saint-Laurent, Mont-Royal*), passages piétons zébrés et les légendaires cônes orange de construction.

---

## 📐 3. Modèles Mathématiques & Progression Rigoureuse

### A. Courbe d'Expérience Exponentielle (Niveaux 1 à 99)
$$EXP_{\text{requis}}(L) = \lfloor 120 \times L^{2.4} \rfloor$$

| Niveau ($L$) | EXP Palier | EXP Cumulée | Dégâts Psychiques |
| :---: | :---: | :---: | :---: |
| **1** | $120$ | $0$ | $25$ |
| **25** | $267\,435$ | $1\,842\,100$ | $340$ |
| **50** | $1\,411\,720$ | $14\,620\,900$ | $1\,150$ |
| **75** | $3\,726\,480$ | $52\,380\,400$ | $2\,890$ |
| **99** | $7\,512\,890$ | $141\,850\,000$ | $6\,450$ |

### B. Équation de Probabilité du Moteur de Butin (Loot Engine)
$$P(\text{Drop}) = \min\left(0.85, 0.30 \times \left(1 + 0.15 \times Tier\right)\right)$$

* **Standard (Gris) :** $P < 0.45 - (Tier \times 0.03)$
* **Rare (Bleu) :** $0.45 \le P < 0.75 - (Tier \times 0.02)$
* **Épique (Violet néon) :** $0.75 \le P < 0.94 - (Tier \times 0.01)$
* **Légendaire (Orange Flamboyant) :** $P \ge 0.94 - (Tier \times 0.01)$

---

## 💎 4. Moteur d'Itemisation & Occultiste Diablo 4

* **Item Power (1 à 800) & Paliers :** Basique ($<150$), Avancé ($151-340$), Expert ($341-525$), Ancestral ($526-725$), et Über ($726-800$).
* **Comparateur Dynamique d'Équipement :** Visualisation des différentiels de stats en vert (`▲ +X`) et en rouge (`▼ -X`).
* **Architecte Neural (Occultiste D4) :**
  1. **Extraction d'Aspect :** Consomme un légendaire pour stocker son pouvoir dans le codex permanent.
  2. **Imprégnation d'Aspect :** Grave un Aspect sur un objet Rare pour le transformer en Légendaire.
  3. **Ré-encoder (Enchantement) :** Relance aléatoirement 1 affixe spécifique.
  4. **Châsses & Modules Neuraux :** Système de gemmes d'Attaque, Défense et Utilité.

---

## ⚔️ 5. Systèmes de Combat & Affixes d'Élites

* **Boucle Générateur / Dépenseur de Psi :** Taillades de cyber-lames générant **+8 à +12 Psi** par impact.
* **Système de Potions à Charges :** 4 fioles tactiques ([F]), se rechargeant d'une charge toutes les 15 éliminations.
* **Effets de Statut Élémentaires :**
  * 💥 *Neural Breach* (Vulnérabilité +25% dégâts)
  * ❄️ *Cryo-Lock* (Gel & réduction de vitesse)
  * 🩸 *Circuit Bleed* (Saignement DoT)
  * ☣️ *Malware* (Poison DoT persistant)
* **10 Affixes d'Élites avec Télégraphie Visuelle :** Mortiers balistiques télégraphiés au sol, barrières laser Pare-feu, mines à impulsions, auras EMP et camouflages optiques.

---

## 🕹️ 6. Contrôles & Raccourcis Clavier

| Touche | Action |
| :--- | :--- |
| **Clic Gauche** | Taillade Cyber-Lame Directionnelle (Générateur Psi) |
| **[Q]** | Faille / Lance Synaptique |
| **[W]** | Décharge EMP Shockwave |
| **[E]** | Vortex Psychique (Vulnérabilité de zone) |
| **[R]** | Overclock Temporel (Bullet-Time) |
| **[ESPACE]** | Dash Furtif (i-frames d'invulnérabilité) |
| **[F]** | Boire une Potion de Bio-Santé |
| **[O]** | Ouvrir l'Occultiste / Architecte Neural |
| **[G]** | Cyber-Forge (Synthèse 3 $\rightarrow$ 1) |
| **[I]** | Inventaire D4 & Comparateur |
| **[C]** | Profil Cybernétique & Personnalisation |
| **[K]** | Arbre de Talents |
| **[M]** | Sélecteur de Secteurs de Montréal & Difficulté Tiers 1-10 |
| **[P]** | Escouade d'IA Compagnons (Deus Ex Sophia) |
| **[X]** | Codex Lore & Renseignement |
| **[U]** | Succès & Badges Débloqués |

---

## 🐳 7. Installation & Lancement Docker

```bash
docker compose up -d --build
```

L'application est servie immédiatement sur **`http://localhost:3000`** avec Nginx Alpine.

---

## 💻 8. Développement Local (sans Docker)

```bash
# 1. Installation des dépendances
npm install

# 2. Lancement du serveur Vite de développement
npm run dev
```

---

## 📜 9. Licence
Projet sous licence MIT.
