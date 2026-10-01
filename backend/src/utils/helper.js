// Json response in route 
export const jsonRes = (schema, description) => ({
  content: { 'application/json': { schema } },
  description,
})
