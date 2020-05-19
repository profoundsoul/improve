import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify-es';
import browsersync from 'rollup-plugin-browsersync'

const env = process.env;

const isProduction = env.NODE_ENV === 'production'
const isESMModule = env.format === 'es'
const suffix = env.suffix || '';
const outputFileSuffix = env.suffix ? `.${env.suffix}` : '';


console.log(isProduction, isESMModule, 'output---->');


let rollupConfig = {
    output:{
        file: `dist/VConsoleTool${outputFileSuffix}.js`,
        format: env.format,
        name: 'VConsoleTool'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({ runtimeHelpers: true}),
    ]
  };

  // 根据文件后缀识别
  if(suffix.includes('vue')){
    rollupConfig.input = path.resolve(__dirname, 'src/vue.js');
  }else{
    rollupConfig.input = path.resolve(__dirname, 'src/index.js');
  }

  if(isProduction){
    if(!isESMModule){
      rollupConfig.plugins.push(uglify())
    }
  }else{
    new browsersync({
        host: 'localhost',
        port: 1337,
        files: ['./dist/**/*', './demos/**/*'],
        server: {
            baseDir: ['./'],
            index: '/demos/index.html'
        },
        watchOptions:{
          cwd: './src'
        }
    })
  }

  export default rollupConfig;