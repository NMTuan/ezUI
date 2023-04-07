<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 17:13:38
 * @LastEditTime: 2023-04-07 17:22:48
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\components\my\button.vue
-->
<template>
    <ez-button :class="[
        `ez-button--${type}`,
        `ez-button--${size}`,
        light ? 'is_light' : '',
    ]">
        <slot v-for="(slot, name) in slots" :name="name"></slot>
    </ez-button>
</template>
<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'default'
    },
    light: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'base'
    }
})

const slots = useSlots()

// const classNames = computed(() => {
//     const cls = []
//     switch (props.type) {
//         case 'primary':
//             cls.push('bg-primary')
//             cls.push('border-primary')
//             break
//         case 'secondary':
//             cls.push('bg-secondary')
//             cls.push('border-secondary')
//             break
//         case 'success':
//             cls.push('bg-success')
//             cls.push('border-success')
//             break
//         case 'warning':
//             cls.push('bg-warning')
//             cls.push('border-warning')
//             break
//         case 'danger':
//             cls.push('bg-danger')
//             cls.push('border-danger')
//             break
//         case 'info':
//             cls.push('bg-info')
//             cls.push('border-info')
//             break
//         case 'default':
//         default:
//             cls.push('')
//             cls.push('')
//             cls.push('')
//     }
//     // if (props.type !== 'default') {
//     cls.push('text-white')
//     // cls.push('border-none')
//     // }
//     return cls
// })
</script>
<style lang="scss" scoped>
@import '~/style/common.scss';

:deep {

    &.ez-button {
        @apply inline-block align-middle;
        @apply rounded;
        // @apply px-4 py-2 mx-2;
        @apply border border-solid;

        @each $type in $types {
            &--#{$type} {
                @include color-type($type);

                &.is_light {
                    @include color-type($type, true);
                }
            }
        }

        @each $size in $sizes {
            &--#{$size} {
                @apply text-#{$size};
                @apply p-#{$size};
                @apply h-#{$size};

                .ez-button__icon {
                    @apply bg-red-400;
                }
            }
        }


        &--disabled {
            @apply opacity-50;
        }
    }
}
</style>
