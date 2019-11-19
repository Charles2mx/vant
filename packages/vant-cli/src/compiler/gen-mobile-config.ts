import { join, relative } from 'path';
import { existsSync, ensureDirSync, writeFileSync } from 'fs-extra';
import { decamelize, pascalize, removeExt, getComponents } from '../common';
import {
  SRC_DIR,
  DIST_DIR,
  MOBILE_CONFIG_FILE,
  CONFIG_FILE
} from '../common/constant';

type DemoItem = {
  name: string;
  path: string;
};

function genImports(demos: DemoItem[]) {
  return demos
    .map(item => {
      const relativePath = relative(DIST_DIR, item.path);
      return `import ${item.name} from '${removeExt(relativePath)}';`;
    })
    .join('\n');
}

function genExports(demos: DemoItem[]) {
  return `export const demos = {\n  ${demos
    .map(item => item.name)
    .join(',\n  ')}\n};`;
}

function genConfig(demos: DemoItem[]) {
  // eslint-disable-next-line
  const config = require(CONFIG_FILE);
  const demoNames = demos.map(item => decamelize(item.name, '-'));

  config.nav = config.nav.filter((group: any) => {
    group.items = group.items.filter((item: any) => (demoNames.includes(item.path)));
    return group.items.length;
  });

  return `export const config = ${JSON.stringify(config, null, 2)}`;
}

function genCode(components: string[]) {
  const demos = components
    .map(component => ({
      name: pascalize(component),
      path: join(SRC_DIR, component, 'demo/index.vue')
    }))
    .filter(item => existsSync(item.path));

  return `${genImports(demos)}\n\n${genExports(demos)}\n${genConfig(demos)}\n`;
}

export function genMobileConfig() {
  const components = getComponents();
  const code = genCode(components);

  ensureDirSync(DIST_DIR);
  writeFileSync(MOBILE_CONFIG_FILE, code);
}
