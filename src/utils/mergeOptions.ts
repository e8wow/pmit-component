export default ($vm: any, options: object): object => {
    const defaults: any = {}
    for (const i in $vm.$options.props) {
        if (i !== 'value') {
            defaults[i] = $vm.$options.props[i].default
        }
    }
    const opt = Object.assign({}, defaults, options)
    $vm = {...$vm, ...opt}
    return $vm
}
