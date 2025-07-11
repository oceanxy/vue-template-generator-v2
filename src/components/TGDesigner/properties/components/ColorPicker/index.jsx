import TGColorPicker from '@/components/TGColorPicker'

export default {
  name: 'PropertyColorPicker',
  props: { ...TGColorPicker.props },
  setup(props, { attrs }) {
    return () => (
      <div class={'tg-designer-property-comp tg-designer-property-comp-color-picker'}>
        <div class={'tg-designer-property-comp-color-picker-wrapper'}>
          <TGColorPicker
            value={props.value}
            defaultValue={props.defaultValue}
            {...attrs}
          />
        </div>
      </div>
    )
  }
}
