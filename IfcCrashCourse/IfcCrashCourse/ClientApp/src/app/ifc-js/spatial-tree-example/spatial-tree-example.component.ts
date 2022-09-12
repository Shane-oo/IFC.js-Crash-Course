import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
interface Node {
  expressID: number;
  type: string;
  children: Node[];
}
@Component({
             selector: 'app-spatial-tree-example',
             templateUrl: './spatial-tree-example.component.html',
             styleUrls: ['./spatial-tree-example.component.css']
           })
export class SpatialTreeExampleComponent implements OnInit, AfterViewInit {

  private ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
  private directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 2);
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
  private gridHelper: THREE.GridHelper = new THREE.GridHelper(50, 30);


  private clock: THREE.Clock = new THREE.Clock();


  // raycaster
  private mouse: THREE.Vector2 = new THREE.Vector2();

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private previousSelectedUuid: string = '';

  // ifc loader
  private ifcLoader: IFCLoader = new IFCLoader();

  // models
  private ifcModels: any[] = [];

  // highlight
  private preselectMat: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
                                                                                    transparent: true,
                                                                                    opacity: 0.6,
                                                                                    color: 0xff88ff,
                                                                                    depthTest: false
                                                                                  });

  private preselectModel = {id: 1};

  constructor() {
    CameraControls.install({THREE: this.subsetOfTHREE});

    this.scene.background = new THREE.Color('black');
    // camera positions
    this.camera.position.z = 15;
    this.camera.position.y = 13;
    this.camera.position.x = 8;


    // lights
    this.directionalLight.position.set(0, 10, 10);
    this.scene.add(this.directionalLight, this.ambientLight);

    // axes / grid
    this.axesHelper.renderOrder = 2;
    this.gridHelper.renderOrder = 1;

    this.scene.add(this.axesHelper, this.gridHelper);


    this.raycaster.firstHitOnly = true;

  };

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {

    this.highlight(event, this.preselectMat, this.preselectModel);

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

  @HostListener('dblclick', ['$event'])
  async onMouseClick(event: MouseEvent) {
    const found = this.cast(event)[0];
    if(found) {
      const index = found.faceIndex;
      if(index) {
        // @ts-ignore
        const geometry = found.object.geometry;
        const ifc = this.ifcLoader.ifcManager;
        const id = ifc.getExpressId(geometry, index);
        // @ts-ignore
        const modelId = found.object.modelID;
        const props = await ifc.getItemProperties(modelId, id, false);
        console.log(props);
        const materialProps = await ifc.getMaterialsProperties(modelId, id, true);
        console.log(materialProps);

      }

    }
  }

  async ngOnInit(): Promise<void> {
    await this.ifcLoader.ifcManager.setWasmPath('./assets/wasm-files/');
    this.ifcLoader.ifcManager.setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast);
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    this.cameraControls = new CameraControls(this.camera, this.canvas);

    this.startRenderingLoop();
  }

  // Adding more logic to that function will make the rendering of each frame slower and hurt the performance of our apps.
  // As a rule of thumb, keep the animation function as small as possible, and use other events

  public async uploadFile(event: any) {

    const file: File = event.target.files[0];

    if(file) {
      let fileUrl = URL.createObjectURL(file);
      const model = await this.ifcLoader.loadAsync(fileUrl);
      model.geometry.center();

      let box = new THREE.Box3().setFromObject(model);
      let size = box.getSize(new THREE.Vector3());
      this.gridHelper.position.set(0, 0 - size.y / 2, 0);

      //ifcModel.position.set(0,size.y/2,0);
      model.geometry.boundsTree = null;
      model.geometry.boundingBox = null;
      model.geometry.boundingSphere = null;
      this.scene.add(model);
      this.ifcModels.push(model);

      const ifcProject = await this.ifcLoader.ifcManager.getSpatialStructure(model.modelID);
      this.createTreeMenu(ifcProject);
    }

  }

  private startRenderingLoop() {

    let component: SpatialTreeExampleComponent = this;
    (function render() {
      requestAnimationFrame(render);

      // call animation functions
      component.animate();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  // for the rest of the logic (e.g. use the mousemove event to use the Raycaster).
  private animate() {
    const delta = this.clock.getDelta();
    this.cameraControls.update(delta);

  }

  private cast(event: MouseEvent) {
    this.mouse.x = (event.clientX / this.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.ifcModels);


    // casts a ray
    return this.raycaster.intersectObjects(this.ifcModels);
  }

  private highlight(event: MouseEvent, material: THREE.MeshLambertMaterial, model: any) {
    const found = this.cast(event)[0];
    if(found) {
      // gets model Id
      // @ts-ignore
      model.id = found.object.modelID;

      // Gets express Id
      const index = found.faceIndex;
      // @ts-ignore
      const geometry = found.object.geometry;
      if(index) {
        const id = this.ifcLoader.ifcManager.getExpressId(geometry, index);
        // Creates subst
        this.ifcLoader.ifcManager.createSubset({
                                                 modelID: model.id,
                                                 ids: [id],
                                                 material: material,
                                                 scene: this.scene,
                                                 removePrevious: true
                                               });
      }

    } else {
      // removes previous highlight
      this.ifcLoader.ifcManager.removeSubset(model.id, material);
    }
  }

  private removeAllChildren(element: any) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  // spatial tree menu
  private createTreeMenu(ifcProject:any){
    const root = document.getElementById("tree-root");
    if(root) {
      this.removeAllChildren(root);
      const ifcProjectNode = this.createNestedChild(root, ifcProject);
      ifcProject.children.forEach((child: any) => {
        this.constructTreeMenuNode(ifcProjectNode, child)
      })
    }
  }

  private  nodeToString(node:Node){
    return `${node.type} - ${node.expressID}`;
  }

  private createNestedChild(parent:HTMLElement,node:Node) {
     const content = this.nodeToString(node);
     const root = document.createElement('li');
     this.createTitle(root,content);
     const childrenContainer = document.createElement('ul');
     childrenContainer.classList.add("nested");
     root.appendChild(childrenContainer);
     parent.appendChild(root);
     return childrenContainer;
  }

  private createTitle(parent:HTMLElement,content:string){
     const title = document.createElement("span");
     title.classList.add("caret");
     title.onclick = () =>{
       if(title) {
         //title.parentElement.querySelector(".nested").classList.toggle("active");
       }
     }
  }
}
