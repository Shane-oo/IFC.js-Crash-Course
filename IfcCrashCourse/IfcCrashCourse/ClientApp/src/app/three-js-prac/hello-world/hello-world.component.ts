import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import Stats from 'three/examples/jsm/libs/stats.module';

interface ObjectToTest {
  [uuid: string]: {
    object: THREE.Mesh, color: THREE.Color
  };
}

@Component({
             selector: 'app-hello-world',
             templateUrl: './hello-world.component.html',
             styleUrls: ['./hello-world.component.css']
           })
export class HelloWorldComponent implements OnInit, AfterViewInit {

  private light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);
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
  private width = window.innerWidth;
  private height = window.innerHeight;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({});
  private cameraControls!: CameraControls;
  private axesHelper: THREE.AxesHelper = new THREE.AxesHelper();
  private gridHelper: THREE.GridHelper = new THREE.GridHelper();
  private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  // cube1
  private orangeMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
                                                                                  color: 'orange',
                                                                                  specular: 'white',
                                                                                  shininess: 100,
                                                                                  flatShading: true
                                                                                });
  private cubeMesh: THREE.Mesh = new THREE.Mesh(this.geometry, this.orangeMaterial);
  // cube2
  private greenMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
  private greenCube: THREE.Mesh = new THREE.Mesh(this.geometry, this.greenMaterial);
  // cube3
  private blueMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
  private blueCube: THREE.Mesh = new THREE.Mesh(this.geometry, this.blueMaterial);

  private clock: THREE.Clock = new THREE.Clock();


  // raycaster
  private mouse: THREE.Vector2 = new THREE.Vector2();

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private objectsToTest = [this.cubeMesh, this.greenCube, this.blueCube];
  private previousSelectedUuid: string = '';

  // stats
  private stats: Stats = Stats();

  constructor() {
    CameraControls.install({THREE: this.subsetOfTHREE});

    this.scene.background = new THREE.Color('black');
    this.scene.add(this.cubeMesh, this.greenCube, this.blueCube, this.light);
    // camera positions
    this.camera.position.z = 3;

    // cube positions
    this.greenCube.position.x++;
    this.blueCube.position.x--;

    // light positions
    this.light.position.set(0, 1, 1).normalize();


    // axes / grid
    this.axesHelper.renderOrder = 2;
    this.gridHelper.renderOrder = 1;

    this.scene.add(this.axesHelper, this.gridHelper);

    //stats
    document.body.appendChild(this.stats.dom);
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / this.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.objectsToTest);

    for(const object of this.objectsToTest) {
      // @ts-ignore
      object.material.color.set('#ff0000');

      const intersects = this.raycaster.intersectObject(object);
      if(intersects.length !== 0) {
        if(!this.previousSelectedUuid) {

          // @ts-ignore
          object.material.color.set('orange');
        }
        this.previousSelectedUuid = intersects[0].object.uuid;
      } else {
        this.previousSelectedUuid = '';
      }
    }
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
    const intersect = this.raycaster.intersectObject(this.cubeMesh);
    if(intersect) {
      console.log(intersect);
    }
    const intersects = this.raycaster.intersectObjects([this.cubeMesh, this.blueCube, this.greenCube]);
    if(intersects) {
      console.log(intersects);
    }
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    this.cameraControls = new CameraControls(this.camera, this.canvas);

    this.startRenderingLoop();
  }

  private startRenderingLoop() {

    let component: HelloWorldComponent = this;
    (function render() {
      requestAnimationFrame(render);

      // call animation functions
      component.animate();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  // Adding more logic to that function will make the rendering of each frame slower and hurt the performance of our apps.
  // As a rule of thumb, keep the animation function as small as possible, and use other events
  // for the rest of the logic (e.g. use the mousemove event to use the Raycaster).
  private animate() {
    const delta = this.clock.getDelta();
    this.cameraControls.update(delta);

    this.cubeMesh.rotation.x += 0.01;
    this.cubeMesh.rotation.z += 0.01;

    this.greenCube.rotation.x += 0.015;
    this.greenCube.rotation.z += 0.015;

    this.blueCube.rotation.x += 0.005;
    this.blueCube.rotation.z += .005;

    this.stats.update();

  }
}
