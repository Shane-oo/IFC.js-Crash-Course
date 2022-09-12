import { Component, OnInit } from '@angular/core';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { Color } from 'three';

@Component({
             selector: 'app-viewer-example',
             templateUrl: './viewer-example.component.html',
             styleUrls: ['./viewer-example.component.css']
           })
export class ViewerExampleComponent implements OnInit {
  private viewer!: IfcViewerAPI;

  constructor() {

  }


  ngOnInit(): void {
    let container = document.getElementById('viewerContainer');
    if(container) {
      this.viewer = new IfcViewerAPI({container, backgroundColor: new Color(0xffffff)});
      this.viewer.grid.setGrid();
      this.viewer.axes.setAxes();
      this.viewer.setWasmPath('./assets/wasm-files/');
    } else {
      console.log('container messed up');
    }
  }

  public async uploadFile(event: any) {

    const file: File = event.target.files[0];

    if(file) {
      const model = await this.viewer.IFC.loadIfc(file);
      // Add dropped shadow and post-processing efect
      await this.viewer.shadowDropper.renderShadow(model.modelID);
      this.viewer.context.renderer.postProduction.active = true;
    }

  }
}
