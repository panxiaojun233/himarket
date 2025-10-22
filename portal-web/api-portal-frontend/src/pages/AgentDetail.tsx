import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import { ProductHeader } from "../components/ProductHeader";
import {
  Card,
  Alert,
  Button,
  message,
  Tabs,
  Row,
  Col,
  Collapse,

} from "antd";
import { CopyOutlined, RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { ProductType } from "../types";
import type {
  Product,
  AgentApiProduct,
  ApiResponse,
  ApiProductAgentConfig,
} from "../types";
import remarkGfm from 'remark-gfm';

const { Panel } = Collapse;

function AgentDetail() {
  const { agentProductId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Product | null>(null);
  const [agentConfig, setAgentConfig] = useState<ApiProductAgentConfig | null>(null);

  // 复制到剪贴板函数
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${description}已复制到剪贴板`);
    } catch (error) {
      console.error("复制失败:", error);
      message.error("复制失败，请手动复制");
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!agentProductId) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response: ApiResponse<Product> = await api.get(`/products/${agentProductId}`);
        if (response.code === "SUCCESS" && response.data) {
          setData(response.data);

          // 处理Agent配置
          if (response.data.type === ProductType.AGENT_API) {
            const agentProduct = response.data as AgentApiProduct;

            if (agentProduct.agentConfig) {
              setAgentConfig(agentProduct.agentConfig);
            }
          }
        } else {
          setError(response.message || "数据加载失败");
        }
      } catch (error) {
        console.error("API请求失败:", error);
        setError("加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [agentProductId]);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Alert message="加载中..." type="info" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Alert
            message="加载失败"
            description={error}
            type="error"
            showIcon
          />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Alert message="未找到对应的Agent API" type="warning" showIcon />
        </div>
      </Layout>
    );
  }

  // Helper functions for route display - moved to component level
  const getMatchTypePrefix = (matchType: string) => {
    switch (matchType) {
      case 'Exact': return '等于'
      case 'Prefix': return '前缀是'
      case 'RegularExpression': return '正则是'
      default: return '等于'
    }
  }

  const getRouteDisplayText = (route: any) => {
    if (!route.match) return 'Unknown Route'
    
    const path = route.match.path?.value || '/'
    const pathType = route.match.path?.type
    
    // 拼接域名信息
    let domainInfo = ''
    if (route.domains && route.domains.length > 0) {
      const domain = route.domains[0]
      domainInfo = `${domain.protocol.toLowerCase()}://${domain.domain}`
    }
    
    // 构建基本路由信息（匹配符号直接加到path后面）
    let pathWithSuffix = path
    if (pathType === 'Prefix') {
      pathWithSuffix = `${path}*`
    } else if (pathType === 'RegularExpression') {
      pathWithSuffix = `${path}~`
    }
    
    let routeText = `${domainInfo}${pathWithSuffix}`
    
    // 添加描述信息
    if (route.description && route.description.trim()) {
      routeText += ` - ${route.description.trim()}`
    }
    
    return routeText
  }

  const getMethodsText = (route: any) => {
    if (!route.match?.methods || route.match.methods.length === 0) {
      return 'ANY'
    }
    return route.match.methods.join(', ')
  }

  return (
    <Layout loading={loading}>
      <div className="mb-6">
        <ProductHeader
          name={data?.name || ''}
          description={data?.description || ''}
          icon={data?.icon}
          defaultIcon="/Agent.svg"
          updatedAt={data?.updatedAt}
          productType="AGENT_API"
        />
        <hr className="border-gray-200 mt-4" />
      </div>

      {/* 主要内容区域 - 左右布局 */}
      <Row gutter={24}>
        {/* 左侧内容 */}
        <Col span={15}>
          <Card className="mb-6 rounded-lg border-gray-200">
            <Tabs
              defaultActiveKey="overview"
              items={[
                {
                  key: "overview",
                  label: "Overview",
                  children: data?.document ? (
                    <div className="min-h-[400px]">
                      <div 
                        className="prose prose-lg max-w-none"
                        style={{
                          lineHeight: '1.7',
                          color: '#374151',
                          fontSize: '16px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.document}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No overview available
                    </div>
                  ),
                },
                {
                  key: "configuration",
                  label: `Configuration${agentConfig?.agentAPIConfig?.routes ? ` (${agentConfig.agentAPIConfig.routes.length})` : ''}`,
                  children: agentConfig?.agentAPIConfig ? (
                    <div className="space-y-4">
                      {/* 协议信息 */}
                      <div className="text-sm">
                        <span className="text-gray-700">协议: </span>
                        <span className="font-medium">{agentConfig.agentAPIConfig.agentProtocols?.join(', ') || 'DashScope'}</span>
                      </div>

                      {/* 路由配置表格 */}
                      {agentConfig.agentAPIConfig.routes && agentConfig.agentAPIConfig.routes.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-600 mb-3">路由配置:</div>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <Collapse ghost expandIconPosition="end">
                              {agentConfig.agentAPIConfig.routes.map((route, index) => (
                                <Panel
                                  key={index}
                                  header={
                                    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50">
                                      <div className="flex-1">
                                        <div className="font-mono text-sm font-medium text-blue-600 mb-1">
                                          {getRouteDisplayText(route)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          方法: <span className="font-medium text-gray-700">{getMethodsText(route)}</span>
                                        </div>
                                      </div>
                                      <Button
                                        size="small"
                                        type="text"
                                        icon={<CopyOutlined />}
                                        onClick={async (e) => {
                                          e.stopPropagation()
                                          if (route.domains && route.domains.length > 0) {
                                            const domain = route.domains[0]
                                            const path = route.match?.path?.value || '/'
                                            const fullUrl = `${domain.protocol.toLowerCase()}://${domain.domain}${path}`
                                            await copyToClipboard(fullUrl, "链接")
                                          }
                                        }}
                                      />
                                    </div>
                                  }
                                  style={{
                                    borderBottom: index < agentConfig.agentAPIConfig.routes.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}
                                >
                                  <div className="pl-4 space-y-3">
                                    {/* 域名信息 */}
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">域名:</div>
                                      {route.domains?.map((domain: any, domainIndex: number) => (
                                        <div key={domainIndex} className="text-sm">
                                          <span className="font-mono">{domain.protocol.toLowerCase()}://{domain.domain}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* 匹配规则 */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <div className="text-xs text-gray-500">路径:</div>
                                        <div className="font-mono">
                                          {getMatchTypePrefix(route.match?.path?.type)} {route.match?.path?.value}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">方法:</div>
                                        <div>{route.match?.methods ? route.match.methods.join(', ') : 'ANY'}</div>
                                      </div>
                                    </div>

                                    {/* 请求头匹配 */}
                                    {route.match?.headers && route.match.headers.length > 0 && (
                                      <div>
                                        <div className="text-xs text-gray-500 mb-1">请求头匹配:</div>
                                        <div className="space-y-1">
                                          {route.match.headers.map((header: any, headerIndex: number) => (
                                            <div key={headerIndex} className="text-sm font-mono">
                                              {header.name} {getMatchTypePrefix(header.type)} {header.value}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* 查询参数匹配 */}
                                    {route.match?.queryParams && route.match.queryParams.length > 0 && (
                                      <div>
                                        <div className="text-xs text-gray-500 mb-1">查询参数匹配:</div>
                                        <div className="space-y-1">
                                          {route.match.queryParams.map((param: any, paramIndex: number) => (
                                            <div key={paramIndex} className="text-sm font-mono">
                                              {param.name} {getMatchTypePrefix(param.type)} {param.value}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* 描述 */}
                                    {route.description && (
                                      <div>
                                        <div className="text-xs text-gray-500">描述:</div>
                                        <div className="text-sm">{route.description}</div>
                                      </div>
                                    )}
                                  </div>
                                </Panel>
                              ))}
                            </Collapse>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No configuration available
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧调试功能 */}
        <Col span={9}>
          <Card className="mb-6 rounded-lg border-gray-200">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3">Agent 调试</h3>
              <div className="text-center py-12">
                <div className="mb-4">
                  <RobotOutlined className="text-4xl text-gray-300" />
                </div>
                <div className="text-gray-500 mb-2">
                  <div className="font-medium mb-1">智能对话调试</div>
                  <div className="text-sm">与 Agent 实时对话测试功能</div>
                </div>
                <div className="text-sm text-gray-400">
                  🚀 敬请期待
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}

export default AgentDetail;
