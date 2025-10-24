package com.alibaba.apiopenplatform.service;

import com.alibaba.apiopenplatform.dto.params.gateway.QueryAdpAIGatewayParam;
import com.alibaba.apiopenplatform.dto.result.gateway.GatewayResult;
import com.alibaba.apiopenplatform.dto.result.common.PageResult;

public interface AdpAIGatewayService {
    PageResult<GatewayResult> fetchGateways(QueryAdpAIGatewayParam param, int page, int size);
}