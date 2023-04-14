<template>
    <ez-input :class="[
        `ez-input--${type}`,
        `ez-input--${size || 'base'}`,
    ]">
        <template v-for="(slot, name) in $slots" v-slot:[name]>
            <slot :name="name" :slot="slot"></slot>
        </template>
    </ez-input>
</template>
<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'default'
    },
    // light: {
    //     type: Boolean,
    //     default: false
    // },
    size: {
        type: String,
        default: 'base'
    }
})

const slots = useSlots()
console.log(slots);
</script>
<style lang="scss" scoped>
@import '~/style/common.scss';

:deep {
    &.ez-input {

        .ez-input__container {
            @apply rounded;
        }

        @each $type in $types {
            &--#{$type} {
                .ez-input__container {
                    @include color-type($type, true);
                }
            }
        }

        @each $size in $sizes {
            &--#{$size} {
                .ez-input__container {
                    @apply text-#{$size};
                    @apply p-#{$size};
                    @apply h-#{$size};

                    // &:empty {
                    //     @apply mx-none;
                    // }

                }
            }
        }

        &--loading,
        &--disabled {
            @apply opacity-50;
        }



    }
}
</style>

