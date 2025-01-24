import './global.d.ts'

export default async function (): Promise<void> {
    globalThis.localNodeProvider.destroy()
    await globalThis.localNode.stop()
}
