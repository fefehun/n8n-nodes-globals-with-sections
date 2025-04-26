import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { GLOBAL_CONSTANTS_CREDENTIALS_NAME, GlobalConstantsCredentialsData } from '../../credentials/GlobalConstantsCredentials.credentials';
import { splitConstants } from '../../credentials/CredentialsUtils';


export class GlobalConstants implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Global Constants',
    name: 'globalConstants',
    // eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
    icon: 'file:globals-icon-60px.png',
    group: ['transform', 'output'],
    version: 1,
    description: 'Global Constants',
    subtitle: '={{$parameter["resource"]}}',
    defaults: {
      name: 'Global Constants',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: GLOBAL_CONSTANTS_CREDENTIALS_NAME,
        required: true,
      }
    ],
    properties: [
      {
        displayName: 'Put All Constants in One Key',
        name: 'putAllInOneKey',
        type: "boolean",
        default: true,
        description: "Whether to put all constants in one key or use separate keys for each constant",
      },
      {
        displayName: "Constants Key Name",
        name: "constantsKeyName",
        type: "string",
        default: "constants",
        displayOptions: {
          show: {
            putAllInOneKey: [true],
          },
        },
        description: 'The key under which all constants will be stored.',
      },
      {
        displayName: 'Section Name',
        name: 'sectionName',
        type: 'string',
        default: '',
        placeholder: 'Optional: Specify a section',
        description: 'Optional section name. If not set, constants will be used from the root.',
        required: false,
        hint: 'Leave empty for default behavior. Supports expressions.',
      },      
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] > {
    const credentials = await this.getCredentials(GLOBAL_CONSTANTS_CREDENTIALS_NAME) as unknown as GlobalConstantsCredentialsData;
    const globalConstantsFull = splitConstants(credentials.globalConstants);

    var constantsData: { [key: string]: any } = {};

    const sectionName = this.getNodeParameter('sectionName', 0) as string;
    const globalConstants = sectionName ? globalConstantsFull?.[sectionName] ?? {} : globalConstantsFull ?? {};

    const putAllInOneKey = this.getNodeParameter('putAllInOneKey', 0) as boolean;

    if (putAllInOneKey) {
      const constantsKeyName = this.getNodeParameter('constantsKeyName', 0) as string;
      constantsData = {
        [constantsKeyName]: globalConstants,
      };
    } else {
      // Create a new key for each constant
      constantsData = globalConstants;

    }

    // for each input, add the constants data
    const returnData = this.getInputData();
    if (returnData.length === 0) {
      // create a new item with the constants data
      returnData.push({ json: constantsData });
    } else {
      // add the constants data to each item
      returnData.forEach((item) => {
        item.json = {
          ...item.json,
          ...constantsData,
        };
      });
    }

    return [returnData];
  }
}

