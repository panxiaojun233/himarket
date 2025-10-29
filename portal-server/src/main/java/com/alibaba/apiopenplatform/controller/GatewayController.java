/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package com.alibaba.apiopenplatform.controller;

import com.alibaba.apiopenplatform.core.annotation.AdminAuth;
import com.alibaba.apiopenplatform.dto.params.gateway.ImportGatewayParam;
import com.alibaba.apiopenplatform.dto.params.gateway.QueryAPIGParam;
import com.alibaba.apiopenplatform.dto.params.gateway.QueryAdpAIGatewayParam;
import com.alibaba.apiopenplatform.dto.params.gateway.QueryGatewayParam;
import com.alibaba.apiopenplatform.dto.params.gateway.QueryApsaraGatewayParam;
import com.alibaba.apiopenplatform.dto.result.GatewayMCPServerResult;
import com.alibaba.apiopenplatform.dto.result.*;
import com.alibaba.apiopenplatform.service.GatewayService;
import com.alibaba.apiopenplatform.service.AdpAIGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Tag(name = "网关资源管理")
@RestController
@RequestMapping("/gateways")
@RequiredArgsConstructor
@AdminAuth
public class GatewayController {

    private final GatewayService gatewayService;
    private final AdpAIGatewayService adpAIGatewayService;
    private final com.alibaba.apiopenplatform.service.ApsaraGatewayService apsaraGatewayService;

    @Operation(summary = "获取APIG Gateway列表")
    @GetMapping("/apig")
    public PageResult<GatewayResult> fetchGateways(@Valid QueryAPIGParam param,
                                                   @RequestParam(defaultValue = "1") int page,
                                                   @RequestParam(defaultValue = "500") int size) {
        return gatewayService.fetchGateways(param, page, size);
    }

    @Operation(summary = "获取ADP AI Gateway列表")
    @PostMapping("/adp")
    public PageResult<GatewayResult> fetchAdpGateways(@RequestBody @Valid QueryAdpAIGatewayParam param,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "500") int size) {
        return adpAIGatewayService.fetchGateways(param, page, size);
    }

    @Operation(summary = "获取Apsara Gateway列表")
    @PostMapping("/apsara")
    public PageResult<GatewayResult> fetchApsaraGateways(@RequestBody @Valid QueryApsaraGatewayParam param,
                                                         @RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "500") int size) {
        return apsaraGatewayService.fetchGateways(param, page, size);
    }

    @Operation(summary = "获取导入的Gateway列表")
    @GetMapping
    public PageResult<GatewayResult> listGateways(QueryGatewayParam param, Pageable pageable) {
        return gatewayService.listGateways(param, pageable);
    }

    @Operation(summary = "导入Gateway")
    @PostMapping
    public void importGateway(@RequestBody @Valid ImportGatewayParam param) {
        gatewayService.importGateway(param);
    }

    @Operation(summary = "删除Gateway")
    @DeleteMapping("/{gatewayId}")
    public void deleteGateway(@PathVariable String gatewayId) {
        gatewayService.deleteGateway(gatewayId);
    }

    @Operation(summary = "获取REST API列表")
    @GetMapping("/{gatewayId}/rest-apis")
    public PageResult<APIResult> fetchRESTAPIs(@PathVariable String gatewayId,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "500") int size) {
        return gatewayService.fetchRESTAPIs(gatewayId, page, size);
    }

//    @Operation(summary = "获取API列表")
//    @GetMapping("/{gatewayId}/apis")
//    public PageResult<APIResult> fetchAPIs(@PathVariable String gatewayId,
//                                           @RequestParam String apiType,
//                                           Pageable pageable) {
//        return gatewayService.fetchAPIs(gatewayId, apiType, pageable);
//    }

    @Operation(summary = "获取MCP Server列表")
    @GetMapping("/{gatewayId}/mcp-servers")
    public PageResult<GatewayMCPServerResult> fetchMcpServers(@PathVariable String gatewayId,
                                                              @RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "500") int size) {
        return gatewayService.fetchMcpServers(gatewayId, page, size);
    }

    @Operation(summary = "获取仪表板URL")
    @GetMapping("/{gatewayId}/dashboard")
    public String getDashboard(@PathVariable String gatewayId,
                               @RequestParam(required = false, defaultValue = "API") String type) {
        return gatewayService.getDashboard(gatewayId, type);
    }
}
