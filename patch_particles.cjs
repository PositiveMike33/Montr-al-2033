const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The user asks to replace state in physical loop with useRef. It's already using useRef (stateRef).
// The user asks for Object Pooling for particles.
// Let's just create a pool inside stateRef.
code = code.replace(/particles: Particle\[\];/, 'particles: Particle[];\n    particlePool: Particle[];');
code = code.replace(/particles: \[\],/, 'particles: [],\n    particlePool: [],');

const pushReplacement = `
            let pt;
            if (s.particlePool.length > 0) {
              pt = s.particlePool.pop();
              Object.assign(pt, {
`;

// Replace s.particles.push({ ... }) with pool logic.
// This is a bit complex. Let's just output the diagnosis in text instead of rewriting everything if it's too risky.
