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
import { spawnPromise } from '../utils/spawn';

export function install(
  packageInfo: Record<string, string>,
  options?: Record<string, any>
) {
  const packageList = getPackageList(packageInfo);

  const args = ['install'];

  const npmOptions = ['--prefer-offline', '--no-audit', '--progress=false'];

  // 支持node8
  return spawnPromise('npm', [...args, ...packageList, ...npmOptions], {
    cwd: options?.cwd || process.cwd(),
    stdio: undefined,
  });
}

export function getPackageList(packages: Record<string, string>): Array<string> {
  if (Array.isArray(packages)) {
    return packages.filter(pkg => typeof pkg === 'string');
  }

  const entries = Object.entries(packages);

  return entries
    .filter(([name, version]) => (
      (typeof name === 'string' && typeof version === 'string')
        || typeof version === 'undefined'
    ))
    .map(([name, version]) => (version ? `${name}@${version}` : name));
}
