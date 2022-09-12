import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

@Component({
             selector: 'app-vr-example',
             templateUrl: './vr-example.component.html',
             styleUrls: ['./vr-example.component.css']
           })
export class VrExampleComponent implements OnInit, AfterViewInit {

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

  @ViewChild('loaderContainer')
  private loadingElem!: ElementRef;


  private width = window.innerWidth;
  private height = window.innerHeight;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({});
  private cameraControls!: CameraControls;
  private loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
  private loader: GLTFLoader = new GLTFLoader(this.loadingManager);

  // directionalLight
  private light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);
  private clock: THREE.Clock = new THREE.Clock();

  // 2D Renderer
  // raycaster
  private mouse: THREE.Vector2 = new THREE.Vector2();

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private previousSelectedUuid: string = '';
  private gltfScene: THREE.Group = new THREE.Group();

  private vrButton = VRButton.createButton(this.renderer);

  constructor() {

    document.body.appendChild(this.vrButton);

    CameraControls.install({THREE: this.subsetOfTHREE});

    this.scene.background = new THREE.Color('white');
    this.scene.add(this.light);
    // camera positions
    this.camera.position.z = 3;


    // light positions
    this.light.position.set(0, 1, 1).normalize();


  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private get loadingElement(): HTMLElement {
    return this.loadingElem.nativeElement;
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
    // enable renderer xr property
    this.renderer.xr.enabled = true;

  }


  ngOnInit(): void {


  }

  ngAfterViewInit() {

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    this.cameraControls = new CameraControls(this.camera, this.canvas);
    const loadingText = this.loadingElement.querySelector('p');
    this.loader.load('./assets/models/test-model.gltf',
                     (gltf) => {
                       this.loadingElement.style.display = 'none';
                       this.scene.add(gltf.scene);
                       this.gltfScene = gltf.scene;
                     },
                     (progress) => {
                       const current = (progress.loaded / progress.total) * 100;
                       const formatted = Math.trunc(current * 100) / 100;
                       loadingText!.textContent = `Loading:${formatted}%`;
                     },
                     (error) => {
                       console.log('error occured', error);
                     });


    this.startRenderingLoop();
  }

  private startRenderingLoop() {

    let component: VrExampleComponent = this;
    (function render() {
      component.renderer.setAnimationLoop(function(){
        // call animation functions
        component.animate();
        component.renderer.render(component.scene, component.camera);
      })

    }());
  }

  private animate() {
    const delta = this.clock.getDelta();
    this.cameraControls.update(delta);


  }
}
