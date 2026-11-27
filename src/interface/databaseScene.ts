import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export interface DatabaseSceneController {
  setPaused: (paused: boolean) => void
  setSelected: (index: number) => void
  reset: () => void
  dispose: () => void
}

/** All geometry and textures are local; this scene makes no asset requests. */
export function createDatabaseScene(canvas: HTMLCanvasElement, onSelect: (index: number) => void): DatabaseSceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  const touchDevice = window.matchMedia('(pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, touchDevice ? 1 : 1.5))
  renderer.setClearColor(0x101b35, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100)
  camera.position.set(0, 1.65, 6)
  camera.lookAt(0, .05, 0)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  room.dispose()
  pmrem.dispose()
  const root = new THREE.Group()
  scene.add(root)
  scene.add(new THREE.HemisphereLight(0x9fbaff, 0x172653, 1.2))
  const blueLight = new THREE.PointLight(0x768fff, 12, 14)
  blueLight.position.set(-3, 3, 3)
  scene.add(blueLight)
  const mintLight = new THREE.PointLight(0x8cffe0, 8, 12)
  mintLight.position.set(2, -1, 3)
  scene.add(mintLight)

  const glass = new THREE.MeshPhysicalMaterial({ color: 0x315fc2, metalness: .12, roughness: .2,
    transparent: true, opacity: .8, transmission: .12, thickness: .8, clearcoat: 1, envMapIntensity: .65, side: THREE.DoubleSide })
  const cap = new THREE.MeshPhysicalMaterial({ color: 0x6d8ee3, metalness: .15, roughness: .2,
    transparent: true, opacity: .7, clearcoat: 1, envMapIntensity: .7 })
  const mint = new THREE.MeshBasicMaterial({ color: 0x8bf6d1, toneMapped: false })
  const blue = new THREE.MeshStandardMaterial({ color: 0x789aff, emissive: 0x324b96, emissiveIntensity: .3, metalness: .35, roughness: .2 })
  const cylinderGeometry = new THREE.CylinderGeometry(1.12, 1.12, .59, 64, 1, true)
  const capGeometry = new THREE.CylinderGeometry(1.12, 1.12, .035, 64)
  const ringGeometry = new THREE.TorusGeometry(1.12, .021, 12, 80)
  for (let i = 0; i < 3; i++) {
    const layer = new THREE.Group()
    layer.position.y = (i - 1) * .76
    layer.add(new THREE.Mesh(cylinderGeometry, glass))
    for (const side of [-1, 1]) {
      const disc = new THREE.Mesh(capGeometry, cap)
      disc.position.y = side * .3
      layer.add(disc)
      const rim = new THREE.Mesh(ringGeometry, side === -1 ? mint : blue)
      rim.rotation.x = Math.PI / 2
      rim.position.y = side * .31
      layer.add(rim)
    }
    root.add(layer)
  }

  const tableNames = ['Students', 'Subjects', 'Scores']
  const textures: THREE.Texture[] = []
  const panels: THREE.Group[] = []
  const hitTargets: THREE.Object3D[] = []
  const panelPositions = [[-1.95, 1.02, .1], [1.85, 1.02, -.45], [1.88, -.62, .8]]
  tableNames.forEach((name, index) => {
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 512
    textureCanvas.height = 352
    const ctx = textureCanvas.getContext('2d')!
    ctx.fillStyle = '#4666c4'
    ctx.fillRect(0, 0, 512, 352)
    ctx.fillStyle = '#29458e'
    ctx.fillRect(0, 0, 512, 82)
    ctx.fillStyle = '#f1f6ff'
    ctx.font = '600 38px sans-serif'
    ctx.fillText(name, 28, 55)
    ctx.strokeStyle = '#b2c8ff'
    ctx.lineWidth = 2
    for (let row = 0; row < 5; row++) {
      const y = 86 + row * 58
      ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(496, y); ctx.stroke()
    }
    for (let col = 1; col < 3; col++) {
      ctx.beginPath(); ctx.moveTo(col * 167, 86); ctx.lineTo(col * 167, 336); ctx.stroke()
    }
    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.push(texture)
    const group = new THREE.Group()
    group.position.set(...panelPositions[index] as [number, number, number])
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.16, .8, .065), blue)
    plate.userData.tableIndex = index
    group.add(plate)
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1.12, .76), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .95 }))
    front.position.z = .037
    front.userData.tableIndex = index
    group.add(front)
    hitTargets.push(front, plate)
    root.add(group)
    panels.push(group)
  })

  const orbitPoints = Array.from({ length: 97 }, (_, i) => {
    const angle = i / 96 * Math.PI * 2
    return new THREE.Vector3(Math.cos(angle) * 2.45, .1, Math.sin(angle) * 1.75)
  })
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),
    new THREE.LineBasicMaterial({ color: 0x789fff, transparent: true, opacity: .5 }))
  root.add(orbit)
  const particles = [0, 1, 2].map(index => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(.065, 16, 16), index === 0 ? mint : blue)
    root.add(sphere)
    return sphere
  })
  const grid = new THREE.GridHelper(14, 28, 0x3b5881, 0x233b60)
  grid.position.y = -1.45
  grid.material.transparent = true
  grid.material.opacity = .24
  scene.add(grid)

  let paused = false
  let selected = 0
  let visible = true
  let disposed = false
  let dragging = false
  let moved = false
  let previousX = 0
  let previousY = 0
  let targetRotation = -.16
  let targetTilt = 0
  let lastTime = 0
  let phase = 0
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const cameraQuaternion = new THREE.Quaternion()
  const inverseRoot = new THREE.Quaternion()

  function render(time = 0) {
    if (disposed) return
    const delta = Math.min((time - lastTime) / 1000, .04)
    lastTime = time
    if (!paused && !dragging) { targetRotation += delta * .1; phase += delta }
    root.rotation.y += (targetRotation - root.rotation.y) * .12
    root.rotation.x += (targetTilt - root.rotation.x) * .12
    root.updateMatrixWorld()
    camera.getWorldQuaternion(cameraQuaternion)
    root.getWorldQuaternion(inverseRoot).invert()
    panels.forEach((panel, index) => {
      panel.quaternion.copy(inverseRoot).multiply(cameraQuaternion)
      const scale = index === selected ? 1.08 : 1
      panel.scale.setScalar(THREE.MathUtils.lerp(panel.scale.x, scale, .12))
      panel.position.y = panelPositions[index][1] + Math.sin(phase * .7 + index) * .06
    })
    particles.forEach((particle, index) => {
      const angle = phase * .3 + index * Math.PI * 2 / 3
      particle.position.set(Math.cos(angle) * 2.45, .1, Math.sin(angle) * 1.75)
    })
    renderer.render(scene, camera)
  }
  function animate(time: number) {
    if (touchDevice && time - lastTime < 1000 / 30) return
    render(time)
  }
  function updateLoop() {
    renderer.setAnimationLoop(visible && !document.hidden && !paused ? animate : null)
    render(lastTime)
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Fit the whole orbit continuously, including widths just above a breakpoint.
    camera.position.z = Math.max(6, 10 / camera.aspect)
    camera.updateProjectionMatrix()
    render(lastTime)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    updateLoop()
  })
  intersectionObserver.observe(canvas)
  document.addEventListener('visibilitychange', updateLoop)

  function pointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragging = true; moved = false
    previousX = event.clientX; previousY = event.clientY
    canvas.setPointerCapture(event.pointerId)
  }
  function pointerMove(event: PointerEvent) {
    if (!dragging) return
    const dx = event.clientX - previousX
    const dy = event.clientY - previousY
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
    targetRotation += dx * .008
    targetTilt = THREE.MathUtils.clamp(targetTilt + dy * .003, -.25, .25)
    previousX = event.clientX; previousY = event.clientY
    if (paused) { root.rotation.set(targetTilt, targetRotation, 0); render(lastTime) }
  }
  function pointerUp(event: PointerEvent) {
    if (!dragging) return
    dragging = false
    if (!moved) {
      const rect = canvas.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(hitTargets)[0]
      if (hit) onSelect(hit.object.userData.tableIndex as number)
    }
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  function pointerCancel() { dragging = false }
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  resize()
  updateLoop()
  return {
    setPaused(value) { paused = value; updateLoop() },
    setSelected(index) { selected = index; render(lastTime) },
    reset() { targetRotation = -.16; targetTilt = 0; phase = 0; root.rotation.set(0, -.16, 0); render(lastTime) },
    dispose() {
      if (disposed) return
      disposed = true
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', updateLoop)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerCancel)
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry)
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material)
        }
      })
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      textures.forEach(texture => texture.dispose())
      environment.dispose()
      renderer.dispose()
    },
  }
}
