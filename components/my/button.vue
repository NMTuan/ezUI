<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 17:13:38
 * @LastEditTime: 2023-04-14 13:47:23
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\components\my\button.vue
-->
<template>
    <ez-button :class="[
        `ez-button--${type}`,
        `ez-button--${size || 'base'}`,
        light ? 'is_light' : '',
    ]">
        <template v-for="(slot, name) in $slots" v-slot:[name]>
            <slot :name="name" :slot="slot"></slot>
        </template>
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

                .ez-button__content {
                    @apply text-#{$size};
                    @apply p-#{$size};
                    @apply h-#{$size};

                    @if $size =='xs' {
                        @apply mx-0.5;
                    }

                    @if $size =='sm' {
                        @apply mx-0.75;
                    }

                    @if $size =='base' {
                        @apply mx-1;
                    }

                    @if $size =='lg' {
                        @apply mx-1.25;
                    }

                    &:empty {
                        @apply mx-none;
                    }

                }
            }
        }

        &--loading,
        &--disabled {
            @apply opacity-50;
        }

        &--loading {
            @apply cursor-default;
        }
    }
}
</style>
