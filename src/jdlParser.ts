import _ = require('underscore');
var nomnoml = require( 'nomnoml' );

enum EntityType {
    Entity = 'entity',
    Enum = 'enum',
    Relationship = 'relationship'
}

class JDLEnum {
    name: string;
    fields: JDLEnumField[];
}

class JDLEnumField {
    value: string;
}

class JDLEntityField {
    name: string;
    type: string;
}

class JDLEntity {
    name: string;
    fields: JDLEntityField[];
}

class JDLRelationship {
    source: string;
    type: string;
    target: string;
}

class JDLObj {
    Enums: JDLEnum[];
    Entities: JDLEntity[];
    Relationships: JDLRelationship[];
}


export class JDLParser { 

    public parse(source) {
        // Remove // line comments
        let source_string = source.replace(/\/\/.*$/gm, ' ');
            // remove /n
            source_string = source_string.replace(/\n/g, ' ');
            //remove /t
            source_string = source_string.replace(/\t/g, ' ');
            // remove /**  */ comments
            source_string = source_string.replace(/\/\*\*.*?\*\//g, ' ');
        let entities = this.getClass(source_string, 'entity');
        let enums = this.getClass(source_string, 'enum');
        let relationships = this.getClass(source_string, 'relationship');

        
        return source_string
    }

    private convertToNonoml(jdlObj: JDLObj) {
        let result = []



    }

    private getClass(str, startWord) {
        let results: JDLObj[] = [];
        let text;
        let re = new RegExp(`${startWord}\\s(\\w.*?)\\s\\{(.*?)\\s\\}`,"g");
      
        let jdlObj: JDLObj = new JDLObj();
            jdlObj.Entities = [];
            jdlObj.Enums = [];
            jdlObj.Relationships = [];

        while(text = re.exec(str)) {
            
            switch(startWord) {
                case EntityType.Entity: {
                    let jdlEntity: JDLEntity = new JDLEntity();
                        jdlEntity.name = text[1].trim();
                        jdlEntity.fields = this.parseEntityBody(text[2].trim(), startWord);
                    jdlObj.Entities.push(jdlEntity);
                    break;
                }
                case EntityType.Enum: {
                    let jdlEnum: JDLEnum = new JDLEnum()
                        jdlEnum.fields = this.parseEnumBody(text[2].trim(), startWord);
                    jdlObj.Enums.push(jdlEnum);
                    break;
                }
                case EntityType.Relationship: {
                    let jdlRelationship: JDLRelationship = new JDLRelationship();
                    jdlObj.Relationships.push(jdlRelationship);
                    break;
                }
                default: {
                    console.log("No EntityType matched");
                    break;
                }
            }
          
        }
        return jdlObj;
    }

    private parseEnumBody(body, startWord): JDLEnumField[] {
        let fields = body.split(',');
        return this.extractEnum(fields);
    }

    private parseEntityBody(body, startWord): JDLEntityField[] {
        let fields = body.split(',');
        return this.extractEntity(fields);
    }

    private parseRelationshipBody(body, startWord): JDLRelationship[] {
        let fields = body.split(',');
        return this.extractRelationship(fields);
    }



    private extractEntity(fields): JDLEntityField[] {
        let result: JDLEntityField[] = [];

        for (let field of fields) {
            let name = field.trim().split(' ')[0]; 
            let type = field.trim().split(' ')[1];

            result.push({ name: name, type: type})
        }


        return result;
    }

    private extractEnum(fields): JDLEnumField[] {
        let result: JDLEnumField[] = [];

        for (let field of fields) {
            result.push({ value: field.trim() })
        }

        return result;
    }

    private extractRelationship(fields): JDLRelationship[] {
        let result: JDLRelationship[] = [];
        for (let field of fields) {
            let parts = field.match(/(\w*)\{(.*?)\}\sto\s(\w*)/);
            let source = parts[1];
            let type = parts[2];
            let target = parts[3];
            result.push({ source: source, type: type, target: target })
        }

        return result;
    }

}