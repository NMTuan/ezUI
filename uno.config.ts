/*
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 11:35:00
 * @LastEditTime: 2023-04-06 14:29:01
 * @LastEditors: NMTuan
 * @Description:
 * @FilePath: \ezUI\uno.config.ts
 */
// uno.config.ts
import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno' // 预设，包括 wind 和 mini
import presetAttributify from '@unocss/preset-attributify' // <a bg="blue-400" text="sm white" />
import presetIcons from '@unocss/preset-icons' // <div class="i-ri-arrow-right-up-line mx-auto"></div>
import transformerVariantGroup from '@unocss/transformer-variant-group' // <div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>
import transformerDirectives from '@unocss/transformer-directives'  // @apply

export default defineConfig({
    // ...UnoCSS options
    presets: [presetUno(), presetAttributify(), presetIcons()],
    transformers: [transformerVariantGroup(), transformerDirectives()]
})
