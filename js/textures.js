import * as THREE from "three";

// Original, deterministic canvas artwork: no downloaded models or game assets.
let seed = 42;
function random() {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
}
export function canvasTexture(draw, width = 256, height = width) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function repeat(texture, x = 1, y = x) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(x, y);
  return texture;
}
export const stoneTexture = repeat(canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#a99574"; ctx.fillRect(0, 0, w, h);
  for (let row = 0; row < 8; row++) {
    for (let col = -1; col < 5; col++) {
      const x = col * 64 + (row % 2) * 32;
      ctx.fillStyle = ["#dbccb1", "#cfbe9d", "#e1d2b7", "#c5b28d"][Math.floor(random() * 4)];
      ctx.fillRect(x + 2, row * 32 + 2, 60, 28);
      ctx.fillStyle = "#eee0c650"; ctx.fillRect(x + 3, row * 32 + 3, 58, 3);
    }
  }
}), 2, 1.5);
export const woodTexture = repeat(canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#8e5737"; ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) {
    ctx.fillStyle = "#543c2b"; ctx.fillRect(x, 0, 3, h);
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = "#d89c5d55"; ctx.beginPath(); ctx.moveTo(x + 5 + i * 4, 0);
      ctx.bezierCurveTo(x + i * 4, 90, x + 12 + i * 4, 180, x + 5 + i * 4, h); ctx.stroke();
    }
  }
}), 2, 2);
export const grassTexture = repeat(canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#879b61"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = i % 2 ? "#b3bd8250" : "#506f4c30";
    ctx.fillRect(random() * w, random() * h, 2, 4);
  }
}), 6);
export const roofTexture = repeat(canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#9e4e38"; ctx.fillRect(0, 0, w, h);
  for (let row = 0; row < 10; row++) {
    for (let col = -1; col < 8; col++) {
      const x = col * 40 + (row % 2) * 20;
      ctx.fillStyle = ["#bb6147", "#ad563e", "#c36a4c"][Math.floor(random() * 3)];
      ctx.fillRect(x + 1, row * 26 + 1, 38, 23);
      ctx.fillStyle = "#663e3240"; ctx.fillRect(x + 1, row * 26 + 21, 38, 3);
    }
  }
}), 2);
export const metalTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#394b4c"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = "#a5bab920"; ctx.fillRect(random() * w, random() * h, 1, random() * 8);
  }
});
export const paperTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#fff0cb"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#738d9d66";
  for (let y = 24; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(w - 14, y); ctx.stroke();
  }
  ctx.fillStyle = "#ba553e"; ctx.font = "bold 60px Georgia"; ctx.fillText("A+?", 65, 140);
});
export const waterTexture = repeat(canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#358b87"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#96d2bd66"; ctx.lineWidth = 2;
  for (let i = 0; i < 50; i++) {
    const x = random() * w, y = random() * h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y - 3, x + 18, y); ctx.stroke();
  }
}), 8);
export const flagTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#e7b84e"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#fff0c8"; ctx.lineWidth = 8; ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = "#334e46"; ctx.font = "bold 132px Georgia"; ctx.textAlign = "center"; ctx.fillText("U", w / 2, 178);
});
export function signTexture(title, subtitle, color = "#b7593f") {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#f4e8cb"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = color; ctx.textAlign = "center";
    ctx.font = "bold 48px Georgia"; ctx.fillText(title, w / 2, 91);
    ctx.fillStyle = "#4f5748"; ctx.font = "bold 23px sans-serif"; ctx.fillText(subtitle, w / 2, 137);
  }, 512, 180);
}
export const targetTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = "#eddbb4"; ctx.fillRect(0, 0, w, h);
  for (let ring = 5; ring >= 1; ring--) {
    ctx.fillStyle = ring % 2 ? "#b95039" : "#f7e9c8";
    ctx.beginPath(); ctx.arc(w / 2, h / 2, ring * 23, 0, Math.PI * 2); ctx.fill();
  }
});
