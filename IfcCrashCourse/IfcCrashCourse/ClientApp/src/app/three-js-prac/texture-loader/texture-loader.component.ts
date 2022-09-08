import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';

@Component({
             selector: 'app-texture-loader',
             templateUrl: './texture-loader.component.html',
             styleUrls: ['./texture-loader.component.css']
           })
export class TextureLoaderComponent implements OnInit, AfterViewInit {

  private subsetOfTHREE = {
    MOUSE: THREE.MOUSE,
    Vector2: THREE.Vector2,
    Vector3: THREE.Vector3,
    Vector4: THREE.Vector4,
    Quaternion: THREE.Quaternion,
    Matrix4: THREE.Matrix4,
    Spherical: THREE.Spherical,
    Box3: THREE.Box3,
    Sphere: THREE.Sphere,
    Raycaster: THREE.Raycaster,
    MathUtils: {
      DEG2RAD: THREE.MathUtils.DEG2RAD,
      clamp: THREE.MathUtils.clamp
    }
  };

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('loading')
  private loadingRef!: ElementRef;


  private width = window.innerWidth;
  private height = window.innerHeight;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({});
  private cameraControls!: CameraControls;
  private loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader(this.loadingManager);

  private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

  private images: string[] = [
    `https://picsum.photos/200/300?random=1`,
    `https://picsum.photos/200/300?random=2`,
    `https://picsum.photos/200/300?random=3`,
    `https://picsum.photos/200/300?random=4`,
    `https://picsum.photos/200/300?random=5`,
    `https://picsum.photos/200/300?random=6`
  ];

  private materials: THREE.MeshBasicMaterial[] = [
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[0])}),
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[1])}),
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[2])}),
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[3])}),
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[4])}),
    new THREE.MeshBasicMaterial({map: this.textureLoader.load(this.images[5])})

  ];


  // directionalLight
  private light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);
  private clock: THREE.Clock = new THREE.Clock();

  constructor() {


    CameraControls.install({THREE: this.subsetOfTHREE});

    this.scene.background = new THREE.Color('black');
    this.scene.add(this.light);
    // camera positions
    this.camera.position.z = 3;


    // light positions
    this.light.position.set(0, 1, 1).normalize();

  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private get loading(): HTMLElement {
    return this.loadingRef.nativeElement;
  }



  @HostListener('window:resize', ['$event'])
  onResize(event: Window) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Update Camera
    this.camera.aspect = this.width / this.height;
    // Alert Camera
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.loadingManager.onLoad = () => {
      this.loading.style.display = 'none';
      const cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.materials);
      this.scene.add(cube);
    };
    this.loadingManager.onProgress = (urlOfLastItemLoaded: string, itemsLoaded: number, itemsTotal: number) => {

      const progress = itemsLoaded / itemsTotal;
      console.log(progress)
      this.loading.style.width = `${progress*100}%`;

    };
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    this.cameraControls = new CameraControls(this.camera, this.canvas);

    this.startRenderingLoop();
  }

  private startRenderingLoop() {

    let component: TextureLoaderComponent = this;
    (function render() {
      requestAnimationFrame(render);

      // call animation functions
      component.animate();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  private animate() {
    const delta = this.clock.getDelta();
    this.cameraControls.update(delta);


  }
}
