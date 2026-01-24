declare module 'three/addons/*' {
  const content: any;
  export default content;
}

declare module 'three' {
  export * from 'three/src/Three';
}
