import * as THREE from 'three'

import Fourier, { IFourier } from './utils/Fourier'

import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import data from '../samples/pentagram.json'

export const params = {
    'Time Scale': 1,
    'Number of Circles': 300
}

type Point = {
    x: number
    y: number
}

let windowContext: any = window;
let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

export let path: Point[] = centerDataPoints(data)
export let graphPoints: Point[] = []
export let fourierX: IFourier[] = new Fourier().generateDiscreteFourierTransform(path, params['Number of Circles'])

let time = 0;

const Circles: { [id: number]: THREE.Mesh } = {}
const Lines: { [id: number]: THREE.Line } = {}

const drawCircle = (key: number, x: number, y: number, r: number) => {
    if (!(key in Circles)) {
        const geometry = new THREE.RingGeometry(r - 0.1 * r, r, 50)

        const material = new THREE.MeshBasicMaterial({ color: 0x0000FF })

        Circles[key] = new THREE.Mesh(geometry, material)
        scene.add(Circles[key])
    }

    Circles[key].position.set(x, y, 0);
}

const drawLine = (key: number, x1: number, y1: number, x2: number, y2: number) => {
    if (!(key in Lines)) {
        const material = new THREE.LineBasicMaterial({ color: 0x00FF00 })
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, 0),
            new THREE.Vector3(x2, y2, 0)
        ])

        Lines[key] = new THREE.LineLoop(geometry, material)
        scene.add(Lines[key])
    }

    const positions = Lines[key].geometry.attributes.position.array
    const bufferAttribute = new THREE.BufferAttribute(positions, 3)

    bufferAttribute.setXYZ(0, x1, y1, 0)
    bufferAttribute.setXYZ(1, x2, y2, 0)
}

const drawCurve = (points: Point[]) => {
    points.forEach(({ x, y }, idx) => {
        if (idx + 1 >= points.length) return;
        drawLine(idx, x, y, points[idx + 1].x, points[idx + 1].y);
    })
};

const epicycles = (x: number, y: number, fourierSeries: IFourier[]): Point => {
    fourierSeries.map(({ frequency, amplitude, phase }, idx) => {
        const prevX = x
        const prevY = y

        const multTerm = frequency * time + phase
        x += amplitude * Math.cos(multTerm)
        y += amplitude * Math.sin(multTerm)

        drawCircle(idx, prevX, prevY, amplitude)
    })

    return { x, y }
}

const startDrawing = () => {
    const point = epicycles(0, 0, fourierX)
    graphPoints.push(point)

    drawCurve(graphPoints)

    time += params['Time Scale'] * ((Math.PI * 2) / fourierX.length)

    if (time > 2 * Math.PI)
        time = 0

    if (graphPoints.length > path.length * 2)
        graphPoints.pop()
};

init();
animate();

function centerDataPoints(points: Point[]): Point[] {
    const xPoints = points.map(({ x }) => x)
    const yPoints = points.map(({ y }) => y)
    const maxX = Math.max(...xPoints)
    const minX = Math.min(...xPoints)
    const maxY = Math.max(...yPoints)
    const minY = Math.min(...yPoints)
    return data.map(({ x, y }) => ({
        x: 2 * ((x - minX) / (maxX - minX) - 0.5),
        y: 2 * ((y - minY) / (maxY - minY) - 0.5)
    }))
}

function init() {
    const scene = setupScene();
    setupCameraAndControls(scene);
    setupWorld()
    setupGUI()
}

function setupGUI() {
    const gui = new GUI()

    gui.add(params, 'Time Scale', 0, 5, 0.1).listen()
    gui.add(params, 'Number of Circles', 1, 50, 1).onChange(value => {
        scene.remove.apply(scene, scene.children)
        fourierX = new Fourier().generateDiscreteFourierTransform(path, value)
    })
}

function setupWorld() {
    const points: THREE.Vector3[] = [];
    path.forEach(({ x, y }) => {
        points.push(new THREE.Vector3(x, y, 0))
    })
}

function setupScene(): THREE.Scene {
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x350089, 0.002)

    /* const axesHelper = new THREE.AxesHelper()
    axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
    scene.add(axesHelper) */

    const loader = new THREE.TextureLoader()
    const bgTexture = loader.load('resources/images/sky.jpg')
    scene.background = bgTexture

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(windowContext.devicePixelRatio)
    renderer.setSize(windowContext.innerWidth, windowContext.innerHeight)

    document.body.appendChild(renderer.domElement)
    windowContext.addEventListener('resize', onWindowResize)

    return scene
}

function setupCameraAndControls(scene: THREE.Scene) {
    const near = 0.1;
    const far = 10;

    camera = new THREE.PerspectiveCamera(70, windowContext.innerWidth / windowContext.innerHeight, near, far);
    camera.position.set(0, 0, 3);
    camera.lookAt(scene.position);

    controls = new OrbitControls(camera, renderer.domElement)
    controls.listenToKeyEvents(windowContext)

    controls.enableDamping = true
    controls.dampingFactor = 0.05

    controls.screenSpacePanning = false

    controls.minDistance = near
    controls.maxDistance = far

    controls.maxPolarAngle = Math.PI / 2
}

function onWindowResize() {
    camera.aspect = windowContext.innerWidth / windowContext.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(windowContext.innerWidth, windowContext.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    startDrawing();
    
    renderer.render(scene, camera);
}