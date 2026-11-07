import * as THREE from 'three';

/**
 * Procedural Canvas Textures for Free Fire:
 * Zero external images/assets. All textures created mathematically.
 */

// Island grass & soil texture
export function createTerrainTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base grass green
  ctx.fillStyle = '#4a7536';
  ctx.fillRect(0, 0, size, size);

  // Grass noise & dirt patches
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 1;
    const greenMod = Math.floor(Math.random() * 40 - 20);
    ctx.fillStyle = `rgb(${74 + greenMod}, ${117 + greenMod}, ${54 + greenMod})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dirt specs
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = 'rgba(120, 95, 60, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 30);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Military / Airdrop Crate Texture
export function createAirdropTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep crimson red military container
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(0, 0, size, size);

  // Metal panel borders
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, size - 14, size - 14);

  // Diagonal hazard stripes on bottom edge
  ctx.fillStyle = '#f59e0b';
  for (let i = 0; i < size; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, size - 50);
    ctx.lineTo(i + 20, size - 50);
    ctx.lineTo(i - 10, size);
    ctx.lineTo(i - 30, size);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#18181b';
  for (let i = 20; i < size + 40; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, size - 50);
    ctx.lineTo(i + 20, size - 50);
    ctx.lineTo(i - 10, size);
    ctx.lineTo(i - 30, size);
    ctx.closePath();
    ctx.fill();
  }

  // Stencil text: AIRDROP / FREE FIRE
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FREE FIRE', size / 2, size / 2 - 30);
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('SUPPLY CRATE', size / 2, size / 2 + 20);

  // Rivets on corners
  ctx.fillStyle = '#374151';
  const rivets = [
    [24, 24], [size - 24, 24],
    [24, size - 64], [size - 24, size - 64]
  ];
  rivets.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Gloo Wall Hexagonal Shield Texture
export function createGlooWallTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep glowing cyan ice backdrop
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#06b6d4');
  grad.addColorStop(0.5, '#0284c7');
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Draw cyber hex pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  const hexRadius = 36;
  const hexHeight = hexRadius * Math.sqrt(3);

  for (let y = -hexHeight; y < size + hexHeight; y += hexHeight) {
    let offset = 0;
    for (let x = -hexRadius; x < size + hexRadius * 3; x += hexRadius * 3) {
      drawHex(ctx, x, y, hexRadius);
      drawHex(ctx, x + hexRadius * 1.5, y + hexHeight / 2, hexRadius);
    }
  }

  // Energy crackle lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(60, 40);
  ctx.lineTo(180, 200);
  ctx.lineTo(260, 180);
  ctx.lineTo(380, 360);
  ctx.lineTo(460, 480);
  ctx.stroke();

  // Free Fire Gloo emblem
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GLOO SHIELD', size / 2, size / 2 + 15);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

// Shipping Container texture
export function createContainerTexture(color: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Vertical corrugated metal ribs
  for (let x = 0; x < size; x += 16) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x, 0, 5, size);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + 5, 0, 4, size);
  }

  // Steel framing
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Camo character vest texture
export function createCamoTexture(baseHue: number = 40): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = `hsl(${baseHue}, 30%, 35%)`;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = Math.random() * 60 + 20;
    const h = Math.random() * 40 + 15;
    const rot = Math.random() * Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const lightness = [20, 50, 25][i % 3];
    ctx.fillStyle = `hsl(${baseHue + (i % 20 - 10)}, 35%, ${lightness}%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
