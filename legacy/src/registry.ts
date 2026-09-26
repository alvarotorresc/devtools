import type { Tool } from './types';
import { uuidTool } from './tools/uuid';
import { jsonTool } from './tools/json-tool';
import { base64Tool } from './tools/base64';
import { jwtTool } from './tools/jwt';
import { hashTool } from './tools/hash';
import { urlEncodeTool } from './tools/url-encode';
import { regexTool } from './tools/regex';
import { timestampTool } from './tools/timestamp';
import { colorTool } from './tools/color';
import { diffTool } from './tools/diff';
import { loremTool } from './tools/lorem';
import { htmlEntitiesTool } from './tools/html-entities';
import { textTool } from './tools/text';
import { numberBaseTool } from './tools/number-base';

export const tools: Tool[] = [
  uuidTool,
  jsonTool,
  base64Tool,
  jwtTool,
  hashTool,
  urlEncodeTool,
  regexTool,
  timestampTool,
  colorTool,
  diffTool,
  loremTool,
  htmlEntitiesTool,
  textTool,
  numberBaseTool,
];
