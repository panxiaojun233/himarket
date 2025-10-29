# Spring Boot 3 升级设计文档

## 1. 升级目标

解决阿里云安全检测发现的 Spring Core 安全漏洞（Issue #72），通过将 Spring Boot 从 2.7.18 升级到 3.3.5 版本，修复底层依赖的安全问题。

## 2. 升级范围

### 2.1 核心框架升级
- Spring Boot: 2.7.18 → 3.3.5
- JDK: 1.8 → 17
- Maven Compiler Plugin: 3.8.1 → 3.11.0

### 2.2 依赖库升级

| 依赖库 | 当前版本 | 目标版本 | 备注 |
|--------|---------|---------|------|
| MyBatis Spring Boot Starter | 2.3.1 | 3.0.3 | 适配 Spring Boot 3 |
| SpringDoc OpenAPI | 1.7.0 | 2.6.0 | 迁移到 springdoc-openapi-starter-webmvc-ui |
| MariaDB Driver | 3.4.1 | 保持不变 | 已兼容 JDK 17 |
| Hutool | 5.8.32 | 保持不变 | 已兼容 JDK 17 |
| Bouncy Castle | 1.78 | 1.78.1 | 推荐小版本更新 |
| SnakeYAML | 2.0 | 由 Spring Boot 3.3.5 管理 | 移除显式版本声明 |
| Jackson Databind | 2.14.0-rc1 | 由 Spring Boot 3.3.5 管理 | 移除显式版本声明，使用 BOM 统一管理 |

### 2.3 命名空间迁移（Jakarta EE）

需要将所有 `javax.*` 包替换为 `jakarta.*` 包：

| 原包名 | 新包名 |
|--------|--------|
| javax.persistence.* | jakarta.persistence.* |
| javax.servlet.* | jakarta.servlet.* |
| javax.validation.* | jakarta.validation.* |

## 3. 升级影响分析

### 3.1 影响的模块

| 模块 | 影响程度 | 主要变更 |
|------|---------|---------|
| portal-dal | 高 | JPA 实体类、Converter 类需迁移 javax.persistence 到 jakarta.persistence |
| portal-server | 中 | Controller、Service 层需适配新 API，移除过时的配置类 |
| portal-bootstrap | 高 | Filter 类需迁移 javax.servlet 到 jakarta.servlet，Dockerfile 需升级 JDK 17 镜像 |

### 3.2 影响的文件类型

- **实体类（Entity）**: 需要更新 JPA 注解导入
- **转换器（Converter）**: 需要更新 JPA AttributeConverter 导入
- **过滤器（Filter）**: 需要更新 Servlet API 导入
- **构建配置**: 所有 pom.xml 和 Dockerfile 需要更新
- **运行时配置**: application.yaml 中部分配置属性可能需要调整

### 3.3 已识别需要迁移的文件

通过代码扫描，识别出至少 25 个文件需要进行 javax → jakarta 命名空间迁移，包括：

- 数据访问层所有转换器（Converter）
- 数据访问层所有实体类（Entity）  
- 启动模块的 PortalResolvingFilter 等过滤器

## 4. 技术方案设计

### 4.1 分阶段升级策略

采用三阶段升级策略，确保每个阶段可独立验证：

#### 阶段一：构建配置升级
- 更新父 pom.xml 和所有子模块 pom.xml
- 升级 Maven 编译器配置到 JDK 17
- 更新所有依赖版本
- 配置 Lombok 注解处理器路径

#### 阶段二：代码命名空间迁移
- 批量替换 javax.persistence → jakarta.persistence
- 批量替换 javax.servlet → jakarta.servlet  
- 批量替换 javax.validation → jakarta.validation
- 处理可能的 API 变更和废弃方法

#### 阶段三：运行环境升级
- 更新 Dockerfile 基础镜像到 eclipse-temurin:17-jre-jammy
- 验证运行时环境变量和启动参数
- 更新部署文档和配置说明

### 4.2 Maven 配置调整

#### 父 pom.xml 关键配置

**属性配置**
- java.version: 1.8 → 17
- spring-boot.version: 2.7.18 → 3.3.5
- mybatis.version: 2.3.1 → 3.0.3
- springdoc.version: 1.7.0 → 2.6.0
- bouncycastle.version: 1.78 → 1.78.1

**编译器插件配置**
- maven-compiler-plugin 版本: 3.8.1 → 3.11.0
- 编译参数调整: 使用 `--release 17` 替代 `-source 17 -target 17`
- 配置 annotationProcessorPaths 包含 Lombok 1.18.30

**依赖管理调整**
- 移除 jackson-databind 显式版本声明，使用 Spring Boot BOM 管理
- springdoc-openapi-ui 替换为 springdoc-openapi-starter-webmvc-ui

#### 子模块 pom.xml 调整

所有子模块（portal-dal、portal-server、portal-bootstrap）需要：
- maven.compiler.source: 8 → 17
- maven.compiler.target: 8 → 17
- portal-bootstrap 中 spring-boot-maven-plugin 版本: 2.7.18 → 3.3.5

### 4.3 命名空间迁移规则

#### 自动化替换策略

采用全局搜索替换方式，确保一致性：

| 搜索模式 | 替换目标 |
|---------|---------|
| import javax.persistence. | import jakarta.persistence. |
| import javax.servlet. | import jakarta.servlet. |
| import javax.validation. | import jakarta.validation. |

#### 需要人工检查的特殊情况

- 字符串常量中包含 "javax" 的引用
- 注释文档中的 javax 包名引用
- 第三方库可能的兼容性问题

### 4.4 Docker 镜像升级

#### 基础镜像变更
- 当前: openjdk:8-jdk-slim
- 目标: eclipse-temurin:17-jre-jammy

#### Dockerfile 调整要点
- 保持工作目录、端口暴露等配置不变
- 确保 JVM 启动参数兼容 JDK 17
- 验证镜像大小和启动性能

### 4.5 配置属性迁移

Spring Boot 3 中部分配置属性已废弃或重命名，需要检查并更新：

| 领域 | 可能影响的配置 |
|------|--------------|
| 日志配置 | logging.file.name 等属性保持兼容 |
| 数据源配置 | spring.datasource.* 大部分保持兼容 |
| JPA 配置 | spring.jpa.* 需验证 Hibernate 6 兼容性 |
| Security 配置 | 部分安全配置 API 可能变更 |

## 5. 兼容性保障

### 5.1 向后兼容性检查

| 检查项 | 兼容性评估 |
|--------|-----------|
| 数据库 Schema | 完全兼容，JPA 实体映射规则未变 |
| REST API 契约 | 完全兼容，HTTP 接口不受影响 |
| 配置文件格式 | 高度兼容，仅个别属性需调整 |
| 外部集成接口 | 需验证阿里云 SDK 与 JDK 17 兼容性 |

### 5.2 第三方依赖兼容性

需要特别关注以下依赖的兼容性：

| 依赖 | 兼容性风险 | 应对策略 |
|------|-----------|---------|
| 阿里云 APIG SDK | 低 | 版本 4.0.10 已支持 JDK 17 |
| 阿里云 MSE SDK | 低 | 版本 7.21.0 已支持 JDK 17 |
| Nacos Maintainer Client | 中 | 需验证 3.0.2 版本与 Spring Boot 3 兼容性 |
| ApsaraStack CSB SDK | 高 | system scope 依赖，需确认本地 JAR 兼容性 |

### 5.3 功能兼容性验证

升级后需要验证以下核心功能：

- 用户认证与授权（OIDC、OAuth2）
- API 产品管理和发布
- 开发者注册和订阅流程
- 网关集成（Higress、APIG、MSE）
- 多租户域名识别

## 6. 风险评估与缓解

### 6.1 主要风险点

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|--------|---------|---------|---------|
| JDK 17 运行时兼容性 | 中 | 整体应用 | 充分的集成测试，准备回滚方案 |
| 第三方 SDK 兼容性 | 中 | 网关集成功能 | 提前验证关键 SDK，联系厂商确认支持 |
| Spring Security 配置变更 | 低 | 认证授权模块 | 参考官方迁移指南，逐步调整配置 |
| 性能回退 | 低 | 整体性能 | 进行性能基准测试对比 |

### 6.2 回滚策略

如果升级后出现严重问题，支持快速回滚：

- 保留 Spring Boot 2.7.18 分支作为备份
- Docker 镜像打标签区分版本
- 数据库 Schema 保持向后兼容
- 配置文件版本化管理

## 7. 测试策略

### 7.1 单元测试

- 确保所有现有单元测试通过
- 针对命名空间迁移的类增加测试覆盖

### 7.2 集成测试

需要重点测试的集成场景：

- 数据库访问和事务管理
- HTTP 请求处理和响应
- OAuth2/OIDC 登录流程
- 网关 API 调用

### 7.3 端到端测试

验证完整业务流程：

- 管理员创建和发布 API 产品
- 开发者注册和订阅产品
- 消费者调用 API 和凭证验证
- 监控和日志功能

## 8. 升级验证标准

### 8.1 成功标准

- 所有单元测试通过
- 所有集成测试通过
- 核心业务流程端到端验证通过
- 无安全漏洞扫描告警
- 性能指标无明显下降（<5%）

### 8.2 验证检查清单

- [ ] Maven 编译成功
- [ ] 所有模块打包成功
- [ ] Docker 镜像构建成功
- [ ] 应用启动无错误日志
- [ ] 数据库连接和操作正常
- [ ] REST API 接口响应正常
- [ ] OIDC/OAuth2 登录正常
- [ ] 网关集成功能正常
- [ ] 安全扫描无高危漏洞
- [ ] 性能测试达标

## 9. 部署建议

### 9.1 部署流程

- 在开发环境完成升级和初步验证
- 在测试环境进行全面功能和性能测试
- 在预生产环境进行灰度验证
- 生产环境分批次升级

### 9.2 注意事项

- 升级前备份数据库
- 准备应急回滚预案
- 监控应用启动和运行日志
- 关注安全扫描结果确认漏洞修复

## 10. 文档更新

需要同步更新的文档：

- README.md 中的 JDK 版本要求（JDK 8 → JDK 17）
- Docker 部署说明中的镜像版本
- Helm 部署说明中的环境要求
- 运行环境配置说明
