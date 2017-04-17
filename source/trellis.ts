import {Type, Type_Category, List_Type} from './type'

export class Trellis_Type extends Type {
  trellis: Trellis

  constructor(name: string, trellis: Trellis) {
    super(name)
    this.trellis = trellis
  }

  get_category(): Type_Category {
    return Type_Category.trellis
  }

  get_other_trellis_name(): string {
    return this.trellis.name
  }
}

export class Property {
  name: string
  type: Type
  trellis: Trellis
  is_nullable: boolean = false
  "default": any
  is_unique: boolean = false

  constructor(name: string, type: Type, trellis: Trellis) {
    this.name = name
    this.type = type
    this.trellis = trellis
  }

  get_path(): string {
    return this.trellis.name + '.' + this.name
  }

  is_reference(): boolean {
    return this.type.get_category() == Type_Category.trellis
      || this.type.get_category() == Type_Category.list
      || this.type.get_category() == Type_Category.incomplete
  }

  is_list(): boolean {
    return this.type.get_category() == Type_Category.list
  }
}

export class Reference extends Property {
  other_property: Property

  constructor(name: string, type: Type, trellis: Trellis, other_property: Property) {
    super(name, type, trellis)
    this.other_property = other_property
  }

  get_other_trellis(): Trellis {
    return this.type.get_category() == Type_Category.trellis
      ? (this.type as Trellis_Type).trellis
      : ((this.type as List_Type).child_type as Trellis_Type).trellis
  }
}

export class Trellis {
  name: string
  properties: {[name: string]: Property} = {}
  primary_key: Property

  private lists: Reference[]

  constructor(name: string) {
    this.name = name
  }

  get_lists(): Reference[] {
    if (this.lists)
      return this.lists

    const result = []
    for (let name in this.properties) {
      const property = this.properties [name]
      if (property.is_list())
        result.push(property)
    }

    this.lists = result
    return result
  }

  get_identity(data) {
    if (!data)
      throw new Error("Identity cannot be empty.")

    const id = data[this.primary_key.name]
    if (id)
      return id

    if (typeof data === 'object')
      throw new Error('Cannot retrieve identity from object because primary key "'
        + this.primary_key.name + '" is missing.')

    return data
  }
}
