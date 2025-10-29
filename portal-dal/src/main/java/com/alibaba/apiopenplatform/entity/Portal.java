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

package com.alibaba.apiopenplatform.entity;

import com.alibaba.apiopenplatform.converter.PortalSettingConfigConverter;
import com.alibaba.apiopenplatform.converter.PortalUiConfigConverter;
import com.alibaba.apiopenplatform.support.portal.PortalSettingConfig;
import com.alibaba.apiopenplatform.support.portal.PortalUiConfig;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "portal",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"portal_id"}, name = "uk_portal_id"),
                @UniqueConstraint(columnNames = {"name", "admin_id"}, name = "uk_name_admin_id")
        })
@Data
public class Portal extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "portal_id", length = 64, nullable = false)
    private String portalId;

    @Column(name = "name", length = 64, nullable = false)
    private String name;

    @Column(name = "description", length = 256)
    private String description;

    @Column(name = "admin_id", length = 64)
    private String adminId;

    @Column(name = "portal_setting_config", columnDefinition = "json")
    @Convert(converter = PortalSettingConfigConverter.class)
    private PortalSettingConfig portalSettingConfig;

    @Column(name = "portal_ui_config", columnDefinition = "json")
    @Convert(converter = PortalUiConfigConverter.class)
    private PortalUiConfig portalUiConfig;

    @Transient
    private List<PortalDomain> portalDomains = new ArrayList<>();
}