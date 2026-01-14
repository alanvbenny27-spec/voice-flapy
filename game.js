let player, pipes;
let jumpVelocity = -350;

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 } }
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);

function preload() {
  this.load.image('player', 'face.png');
  this.load.image('pipe', 'https://i.imgur.com/3Wb9R0P.png');
}

function create() {
  player = this.physics.add.sprite(100, 300, 'player')
    .setScale(0.3)
    .setCollideWorldBounds(true);

  pipes = this.physics.add.group();

  this.time.addEvent({
    delay: 1500,
    callback: () => spawnPipe(this),
    loop: true
  });

  setupMic(this);
}

function spawnPipe(scene) {
  let gap = 150;
  let topHeight = Phaser.Math.Between(50, 300);

  let topPipe = scene.physics.add.sprite(360, topHeight, 'pipe')
    .setOrigin(0, 1);

  let bottomPipe = scene.physics.add.sprite(
    360,
    topHeight + gap,
    'pipe'
  ).setOrigin(0, 0);

  topPipe.body.velocity.x = -200;
  bottomPipe.body.velocity.x = -200;

  pipes.add(topPipe);
  pipes.add(bottomPipe);
}

function setupMic(scene) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext();
      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      mic.connect(analyser);
      analyser.fftSize = 256;
      let data = new Uint8Array(analyser.frequencyBinCount);

      scene.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          analyser.getByteFrequencyData(data);
          let volume = data.reduce((a, b) => a + b) / data.length;

          if (volume > 40) {
            player.setVelocityY(jumpVelocity);
          }
        }
      });
    });
}

function update() {
  if (player.y > 630 || player.y < 10) {
    this.scene.restart();
  }
}
