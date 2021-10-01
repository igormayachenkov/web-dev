//-------------------------------------------------------------
// List                 - simple list control. Loads all data once: loadDataArray(array)
// SortedList           - plus sort by indexes (compare in parameters)
// UpdateableSortedList - allows update some rows applyChanges(channges). 
//                        Data objects must have id field

//-------------------------------------------------------------
// BASE LIST
// Arguments
//  body : jQuery - list container 
export class List{
    constructor(arg){
        this.body     = arg.body
        this.isLoaded = false
    }
	
	empty(){
		// empty body
		this.body.empty();
        // clear flag
        this.isLoaded = false
	}
	
    createRow(obj, id){
        let row = $(`<div objid="${id}"></div>`)
        row.obj = obj // KEEP POINTER TO THE DATA OBJECT !
        this.fillRow (row, obj, id)
        return row
    }

    updateRow(row, obj, id){
        row.empty()
        this.fillRow (row, obj, id)
    }


    appendRows(rows){
        this.body.append(rows)
    }

    //  - array : data array
    loadDataArray(array){
        // Verify & save data
        if(!array) return
        // Empty if need
        if(this.isLoaded) 
            this.empty()
        // Fill rows
        let rows = [] 
        array.forEach((obj,index)=>{ 
            rows.push(this.createRow(obj, null))// id does not matter
        })
        // Reaload controls
        this.appendRows(rows)
        // Set loaded state
        this.isLoaded = true

    }
}

//-------------------------------------------------------------------------
// SORTED LIST
// Arguments
//  compare - set of compare functions
//  header  - sort order change control. Must implement header.order prop
export class SortedList extends List{
    constructor(arg){
        super(arg)
        this.compare = arg.compare
        this.header  = arg.header
        this.indexes = {}		// Sorted row arrays ( indexes[order] must be valid )
        // INIT
        // Attach sort order menu
        this.header.table = this
        // Create indexes 
        for(let key in this.compare){
            this.indexes[key] = null
        } 
        // Bind handlers
        this.compareRows = this.compareRows.bind(this)     

    }
    compareRows(rowA, rowB){
        //console.log('compare',this,rowA.attr('objid'), rowB.attr('objid'))
        //const idA = rowA.attr('objid')
        //const idB = rowB.attr('objid')
        //console.log('compare', this.data, idA, idB)
        //const objA = this.data[rowA.attr('objid')]
        //const objB = this.data[rowB.attr('objid')]
        const objA = rowA.obj
        const objB = rowB.obj
        //console.log('compare', objA, objB)
        const compareFunc = this.compare[this.header.order]
        return compareFunc?compareFunc(objA,objB):0
    }

    appendRows(rows){ // override
        // Get active index
        var index = this.indexes[this.header.order];//active sort order
        if(!index){// calculate if need
            index = rows
            //index.sort(this.compare[order]);
            index.sort(this.compareRows);
        }
        // Load table according to the index
        this.body.append(index)

    }

    sortExistedRows(){
        // Detach rows from the table
        let children = this.body.children()
        children.detach()
        // Resort and append
        this.appendRows(children.toArray())
    }

}

//-------------------------------------------------------------------------
// DYNAMIC SORTED LIST
export class DynamicSortedList extends SortedList{
    constructor(arg){
        super(arg)
        this.rowsMap = new Map()	
    }
    empty(){
        super.empty()
        this.rowsMap.clear()
    }

    getRow(id){
		return this.rowsMap.get(id)
	}

    loadDataArray(){throw "loadDataArray() is not allowed in DynamicSortedList"}
    // loadDataArray(array){
    //     if(!array) return
    //     let changes = {}
    //     array.forEach((item,index)=>{
    //         changes[index] = item
    //     })
    //     this.applyChanges(changes)
    // }

    //  - changes : Map
    applyChanges(changes){
        // Remove old changed state
        this.body.children().removeClass('changed')
        // Apply changes
        if(changes){
            // Verify input
            if(! (changes instanceof Map)){
                console.warn("DynamicSortedList.applyChanges() => Map is required")
                let map = new Map()
                for(let id in changes){
                    map.set(id, changes[id])
                }
                changes = map
            }
            // Process changed objects
            let rows = new Map() // changed rows collection
            for(let [id, obj] of changes.entries()){
                let rowOld = this.getRow(id)
                let row = null
                if(rowOld){
                    // Update
                    row = rowOld
                    this.updateRow(row, obj, id)
                }else{
                    // Insert
                    row = this.createRow(obj, id);
                }
                // Put in changed rows collection
                if(row){
                    rows.set(id, row)
                    if(this.isLoaded) row.addClass('changed');
                }
            }

            // Apply changes
            for(let [id, obj] of rows.entries()) 
                this.rowsMap.set(id, obj) // update/append  rows
            // Detach rows from the table
            this.body.children().detach()
            // Sort & Append
            this.appendRows(Array.from(this.rowsMap.values()))
        }
        // Set loaded state
        this.isLoaded = true
    }
}
