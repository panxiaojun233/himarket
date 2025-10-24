import { useEffect, useState } from "react";
import { Card, Tag, Typography, Input, Avatar, Skeleton } from "antd";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import api from "../lib/api";
import { ProductStatus } from "../types";
import type { Product, ModelApiProduct, ApiResponse, PaginatedResponse, ProductIcon } from "../types";

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface ModelAPI {
  key: string;
  name: string;
  description: string;
  status: string;
  version: string;
  protocols: number;
  category: string;
  creator: string;
  icon?: ProductIcon | null;
  modelConfig?: any;
  updatedAt: string;
}

function ModelPage() {
  const [loading, setLoading] = useState(false);
  const [modelAPIs, setModelAPIs] = useState<ModelAPI[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchModelAPIs();
  }, []);

  // 处理产品图标的函数
  const getIconUrl = (icon?: ProductIcon | null): string => {
    const fallback = "/Model.svg";
    
    if (!icon) {
      return fallback;
    }
    
    switch (icon.type) {
      case "URL":
        return icon.value || fallback;
      case "BASE64":
        // 如果value已经包含data URL前缀，直接使用；否则添加前缀
        return icon.value ? (icon.value.startsWith('data:') ? icon.value : `data:image/png;base64,${icon.value}`) : fallback;
      default:
        return fallback;
    }
  };

  const getModelIcon = (name: string) => {
    // Generate initials for Model icon
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getModelIconColor = (name: string) => {
    const colors = ['#722ed1', '#9254de', '#b37feb', '#d3adf7', '#efdbff', '#f9f0ff'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const fetchModelAPIs = async () => {
    setLoading(true);
    try {
      const response: ApiResponse<PaginatedResponse<Product>> = await api.get("/products?type=MODEL_API&page=0&size=100");
      
      if (response.code === "SUCCESS" && response.data) {
        // 移除重复过滤，简化数据映射
        const mapped = response.data.content.map((item: Product) => {
          // 由于API已经筛选了MODEL_API类型，我们可以安全地进行类型断言
          const modelProduct = item as ModelApiProduct;
          return {
            key: modelProduct.productId,
            name: modelProduct.name,
            description: modelProduct.description,
            status: modelProduct.status === ProductStatus.ENABLE ? 'active' : 'inactive',
            version: 'v1.0.0',
            protocols: 0,
            category: modelProduct.category,
            creator: 'Unknown',
            icon: modelProduct.icon || undefined,
            modelConfig: modelProduct.modelConfig,
            updatedAt: modelProduct.updatedAt?.slice(0, 10) || ''
          };
        });
        setModelAPIs(mapped);
      }
    } catch (error) {
      console.error('获取Model API列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModelAPIs = modelAPIs.filter(model =>
    model.name.toLowerCase().includes(searchText.toLowerCase()) ||
    model.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout>
      {/* Header Section */}
      <div className="text-center mb-8">
        <Title level={1} className="mb-4">
          Model 市场
        </Title>
        <Paragraph className="text-gray-600 text-lg max-w-4xl mx-auto text-flow text-flow-grey slow">
          智能Model API服务集合，提供丰富的AI模型能力接口，支持自动注册、智能路由
        </Paragraph>
      </div>

        {/* Search Section */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search
              placeholder="请输入内容"
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Models Section */}
        <div className="mb-6">
          <Title level={3} className="mb-4">
            热门/推荐 Model APIs: {filteredModelAPIs.length}
          </Title>
        </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-full rounded-lg shadow-lg">
              <Skeleton loading active>
                <div className="flex items-start space-x-4">
                  <Skeleton.Avatar size={48} active />
                  <div className="flex-1 min-w-0">
                    <Skeleton.Input active size="small" style={{ width: '80%', marginBottom: 8 }} />
                    <Skeleton.Input active size="small" style={{ width: '100%', marginBottom: 12 }} />
                    <Skeleton.Input active size="small" style={{ width: '60%' }} />
                  </div>
                </div>
              </Skeleton>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredModelAPIs.map((model) => (
            <Link key={model.key} to={`/models/${model.key}`} className="block">
              <Card
                hoverable
                className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer rounded-lg shadow-lg"
              >
                <div className="flex items-start space-x-4 mb-2">
                  {/* Model Icon */}
                  {model.icon ? (
                    <Avatar
                      size={48}
                      src={getIconUrl(model.icon)}
                    />
                  ) : (
                    <Avatar
                      size={48}
                      style={{ 
                        backgroundColor: getModelIconColor(model.name),
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}
                    >
                      {getModelIcon(model.name)}
                    </Avatar>
                  )}

                  {/* Model Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Title level={5} className="mb-0 truncate">
                        {model.name}
                      </Title>
                      <Tag className="text-xs text-gray-500 border-0 bg-transparent px-0">
                        DashScope
                      </Tag>
                    </div>
                  </div>
                </div>
                <Paragraph className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {model.description}
                </Paragraph>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    更新 {model.updatedAt}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredModelAPIs.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#999'
        }}>
          {searchText ? (
            <>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                未找到匹配的Model API
              </div>
              <div style={{ fontSize: '14px' }}>
                请尝试其他关键词搜索
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                暂无Model服务
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

export default ModelPage;
