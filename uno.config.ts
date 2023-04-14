/*
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 11:35:00
 * @LastEditTime: 2023-04-14 14:43:44
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
import transformerDirectives from '@unocss/transformer-directives' // @apply

export default defineConfig({
    // ...UnoCSS options
    presets: [presetUno(), presetAttributify(), presetIcons()],
    transformers: [transformerVariantGroup(), transformerDirectives()],
    shortcuts: {
        'p-xs': 'px-1 py-0.25',
        'p-sm': 'px-2 py-0.5',
        'p-base': 'px-3 py-0.75',
        'p-lg': 'px-4 py-1',
        'h-xs': 'h-5',
        'h-sm': 'h-6.5',
        'h-base': 'h-8',
        'h-lg': 'h-9.5'
    },
    theme: {
        colors: {
            default: {
                DEFAULT: '#FCFAF2' // https://nipponcolors.com/#sora
            },
            primary: {
                DEFAULT: '#58B2DC' // https://nipponcolors.com/#sora
            },
            secondary: {
                DEFAULT: '#66BAB7' // https://nipponcolors.com/#mizuasagi
            },
            success: {
                DEFAULT: '#86C166' // https://nipponcolors.com/#nae
            },
            warning: {
                DEFAULT: '#E98B2A' // https://nipponcolors.com/#beniukon
            },
            danger: {
                DEFAULT: '#D05A6E' // https://nipponcolors.com/#imayoh
            },
            info: {
                DEFAULT: '#828282' // https://nipponcolors.com/#hai
            }
        }
    }
})
