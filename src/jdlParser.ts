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

class JDLRelationshipField {
    source: string;
    type: string;
    target: string;
}

class JDLRelationship {
    name: string;
    fields: JDLRelationshipField[];
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
        
        let result: JDLObj = this.parseClasses(source_string);

        
        return this.convertToNonoml(result)
    }

    private convertToNonoml(jdlObj: JDLObj) {
        let result = []

        let directives = [
            '#arrowSize: 1',
            '#bendSize: 0.3',
            '#direction: down | right',
            '#gutter: 5',
            '#edgeMargin: 0',
            '#edges: hard | rounded',
            '#fill: #eee8d5; #fdf6e3',
            '#fillArrows: false',
            '#font: Times',
            '#fontSize: 12',
            '#leading: 1.25',
            '#lineWidth: 3',
            '#padding: 8',
            '#spacing: 40',
            '#stroke: #33322E',
            '#title: filename',
            '#zoom: 1'
        ]

        let enums = jdlObj.Enums.map(jdl => {
            return '['+jdl.name+'|'+jdl.fields.map(f => f.value).join(';')+']'
        }).join('\n');

        let entities = jdlObj.Entities.map( jdl => {
            return `[${jdl.name}|${jdl.fields.map(f => f.name + ': ' + f.type).join(';')}]`
        }).join('\n')

        let relationships = jdlObj.Relationships.map( jdl => {
            return jdl.fields.map(f => {
                return `[${f.source}]-[${f.target}]`
            }).join('\n')
        }).join('\n')

        return directives.join('\n') + '\n' + enums + '\n' + entities + '\n' + relationships


    }

    private parseClasses(str): JDLObj {
        let text;
        let startWords = ['entity','enum', 'relationship']
        
        let jdlObj: JDLObj = new JDLObj();
        jdlObj.Entities = [];
        jdlObj.Enums = [];
        jdlObj.Relationships = [];

        for( let startWord of startWords){

            let re = new RegExp(`${startWord}\\s(\\w.*?)\\s\\{(.*?)\\s\\}`,"g");
                
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
                            jdlEnum.name = text[1].trim();
                            jdlEnum.fields = this.parseEnumBody(text[2].trim(), startWord);
                        jdlObj.Enums.push(jdlEnum);
                        break;
                    }
                    case EntityType.Relationship: {
                        let jdlRelationship: JDLRelationship = new JDLRelationship();
                            jdlRelationship.name = text[1].trim();
                            jdlRelationship.fields = this.parseRelationshipBody(text[2].trim(), startWord);
                        jdlObj.Relationships.push(jdlRelationship);
                        break;
                    }
                    default: {
                        console.log("No EntityType matched");
                        break;
                    }
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

    private parseRelationshipBody(body, startWord): JDLRelationshipField[] {
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

    private extractRelationship(fields): JDLRelationshipField[] {
        let result: JDLRelationshipField[] = [];
        for (let field of fields) {
            let parts = field.match(/(\w*)\{(.*?)\}\s+to\s+(\w*)/);
            let source = parts[1];
            let type = parts[2];
            let target = parts[3];
            result.push({ source: source, type: type, target: target })
        }

        return result;
    }

}