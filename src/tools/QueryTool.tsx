import { BaseBoxShapeTool } from "tldraw";

export class QueryTool extends BaseBoxShapeTool {
  static override id = "query";
  static override initial = "idle";
  override shapeType = "query";
}
