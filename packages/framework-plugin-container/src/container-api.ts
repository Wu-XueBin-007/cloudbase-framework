/**
 *
 * Copyright 2020 Tencent
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { CloudApi } from '@cloudbase/framework-core';
import fs from 'fs';

export interface IApiOptions {
  secretId: string;
  secretKey: string;
  token: string;
  envId: string;
}

export class ContainerApi {
  protected cloudApi: typeof CloudApi;

  constructor(cloudApi: typeof CloudApi, public logger: any) {
    this.cloudApi = cloudApi;
  }

  /**
   *
   * 上传代码到 Coding
   * @param packageName
   * @param version
   * @param filePath
   */
  async upload(packageName: string, version: string, filePath: string) {
    const res = await this.describeCloudBaseRunBuildServer();
    const {
      TeamGlobalKey,
      ProjectName,
      PackageRepositoryName,
      ProjectGlobalKey,
      ProjectToken,
    } = res;

    this.logger.debug('describeCloudBaseRunBuildServer', res);

    const url = `https://${TeamGlobalKey}-generic.pkg.coding.net/${ProjectName}/${PackageRepositoryName}/${packageName}?version=${version}`;
    const authorization = Buffer.from(
      `${ProjectGlobalKey}:${ProjectToken}`
    ).toString('base64');

    const response = await this.cloudApi.fetchStream(
      url,
      {
        method: 'PUT',
        body: fs.createReadStream(filePath),
        headers: {
          Authorization: `Basic ${authorization}`,
          ContentType: 'application/octet-stream',
        },
      },
      process.env.http_proxy
    );
    const text = await (await response.text()).trim();

    if (response.status !== 200) {
      console.error(response.url, response.statusText);
      throw new Error('部署云托管代码失败');
    }

    if (text !== 'success') {
      console.error(text);
      throw new Error('部署云托管代码失败');
    }
  }

  /**
   * 查询 Coding 部署信息
   */
  describeCloudBaseRunBuildServer() {
    return this.cloudApi.tcbService.request('DescribeCloudBaseRunBuildServer', {
      Business: 'framework',
    });
  }
}
