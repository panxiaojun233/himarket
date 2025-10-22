export interface ApiProductConfig {
  spec: string;
  meta: {
    source: string;
    type: string;
  }
}

// 产品图标类型
export interface ProductIcon {
  type: 'URL' | 'BASE64';
  value: string;
}

export interface ApiProductMcpConfig {
  mcpServerName: string;
  tools: string;
  meta: {
    source: string;
    mcpServerName: string;
    mcpServerConfig: any;
    fromType: string;
    protocol?: string;
  }
  mcpServerConfig: {
    path: string;
    domains: {
      domain: string;
      protocol: string;
    }[];
    rawConfig?: unknown;
  }
}

export interface ApiProductAgentConfig {
  agentAPIConfig: {
    agentProtocols: string[];
    routes: Array<{
      domains: Array<{
        domain: string;
        protocol: string;
      }>;
      description: string;
      match: {
        methods: string[] | null;
        path: {
          value: string;
          type: string;
        };
        headers?: Array<{
          name: string;
          type: string;
          value: string;
        }> | null;
        queryParams?: Array<{
          name: string;
          type: string;
          value: string;
        }> | null;
      };
    }>;
  };
}

// API 配置相关类型
export interface RestAPIItem {
  apiId: string;
  apiName: string;
}

export interface HigressMCPItem {
  mcpServerName: string;
  fromGatewayType: 'HIGRESS';
}

export interface NacosMCPItem {
  mcpServerName: string;
  fromGatewayType: 'NACOS';
  namespaceId: string;
}

export interface APIGAIMCPItem {
  mcpServerName: string;
  fromGatewayType: 'APIG_AI' | 'ADP_AI_GATEWAY';
  mcpRouteId: string;
  mcpServerId?: string;
  apiId?: string;
  type?: string;
}

export interface AIGatewayAgentItem {
  agentApiId: string;
  agentApiName: string;
  fromGatewayType: 'APIG_AI'; // Agent API 只支持 APIG_AI 网关
}

export type ApiItem = RestAPIItem | HigressMCPItem | APIGAIMCPItem | NacosMCPItem | AIGatewayAgentItem;

// 关联服务配置
export interface LinkedService {
  productId: string;
  gatewayId?: string;
  nacosId?: string;
  sourceType: 'GATEWAY' | 'NACOS';
  apigRefConfig?: RestAPIItem | APIGAIMCPItem | AIGatewayAgentItem;
  higressRefConfig?: HigressMCPItem;
  nacosRefConfig?: NacosMCPItem;
  adpAIGatewayRefConfig?: APIGAIMCPItem; // ADP_AI_GATEWAY 不支持 Agent API
}

export interface ApiProduct {
  productId: string;
  name: string;
  description: string;
  type: 'REST_API' | 'MCP_SERVER' | 'AGENT_API';
  category: string;
  status: 'PENDING' | 'READY' | 'PUBLISHED' | string;
  createAt: string;
  enableConsumerAuth?: boolean;
  autoApprove?: boolean;
  apiConfig?: ApiProductConfig;
  mcpConfig?: ApiProductMcpConfig;
  agentConfig?: ApiProductAgentConfig;
  document?: string;
  icon?: ProductIcon | null;
} 
