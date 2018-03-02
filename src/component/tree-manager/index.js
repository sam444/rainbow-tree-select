import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import flattenTree from './flatten-tree'

export default class TreeManager {
  constructor(tree, config) {
    this._src = tree
    this.tree = flattenTree(cloneDeep(tree), config)
    this.tree.forEach(node => { this.setInitialCheckState(node) })
    this.searchMaps = new Map()
  }

  getNodeById(id) {
    return this.tree.get(id)
  }

  getNodeByIds(ids) {
    let nodeArr = []
    ids.forEach((id) => {
      nodeArr.push(this.tree.get(id))
    })
    return nodeArr
  }


  getNodeIdsByIdRecursive(ids, resultArr) {
    for (let idIndex in ids) {
      let node = this.tree.get(ids[idIndex])
      if (!isEmpty(node._children)) {
        this.getNodeIdsByIdRecursive(node._children, resultArr)
      }
      else {
        resultArr.push(ids[idIndex])
      }
    }
  }


  getMatchesForCheckStatus(checkedValue) {
    let tempObj = {}
    let self = this
    const matches = []
    this.tree.forEach(node => {
      if (node.checked == checkedValue) {
        if (!tempObj[node._id]) {
          self.getNodesALlLeaf(node, matches, tempObj)
          self.getNodesAllParent(node, matches, tempObj)

        }
      }
    })
    return matches
  }

  getMatches(searchTerm, treeSearchMode, labellabel) {
    let tempObj = {}
    let self = this
    if (this.searchMaps.has(searchTerm)) {
      return this.searchMaps.get(searchTerm)
    }

    let proximity = -1
    let closestMatch = searchTerm
    this.searchMaps.forEach((m, key) => {
      if (searchTerm.startsWith(key) && key.length > proximity) {
        proximity = key.length
        closestMatch = key
      }
    })

    const matches = []

    if (closestMatch !== searchTerm) {
      const superMatches = this.searchMaps.get(closestMatch)
      if (treeSearchMode) {
        superMatches.forEach(key => {
          const node = this.getNodeById(key)
          if (node[labellabel].toLowerCase().indexOf(searchTerm) >= 0) {
            if (!tempObj[node._id]) {
              self.getNodesALlLeaf(node, matches, tempObj)
              self.getNodesAllParent(node, matches, tempObj)
            }
          }
        })
      }
      else {
        superMatches.forEach(key => {
          const node = this.getNodeById(key)
          if (node[labellabel].toLowerCase().indexOf(searchTerm) >= 0) {
            matches.push(node._id)
          }
        })
      }
    } else {

      if (treeSearchMode) {
        this.tree.forEach(node => {
          if (node[labellabel].toLowerCase().indexOf(searchTerm) >= 0) {
            if (!tempObj[node._id]) {
              self.getNodesALlLeaf(node, matches, tempObj)
              self.getNodesAllParent(node, matches, tempObj)

            }
          }
        })
      } else {
        this.tree.forEach(node => {
          if (node[labellabel].toLowerCase().indexOf(searchTerm) >= 0) {
            matches.push(node._id)
          }
        })
      }
    }

    this.searchMaps.set(searchTerm, matches)
    return matches
  }


  //获取所有父节点
  getNodesAllParent(node, result, tempObj) {
    if (node._parent) {
      let pNode = this.getNodeById(node._parent)
      if (!tempObj[pNode._id]) {
        result.push(pNode._id)
        tempObj[pNode._id] = true
        this.getNodesAllParent(pNode, result, tempObj)
      }
    }
  }

  //获取所有子节点
  getNodesALlLeaf(node, result, tempObj) {
    result.push(node._id)
    tempObj[node._id] = true
    if (!isEmpty(node._children)) {
      let tempArr = this.getNodeByIds(node._children)
      for (let cNode in tempArr) {
        this.getNodesALlLeaf(tempArr[cNode], result, tempObj)
      }
    }
  }


  //查找所有选中的节点
  filterTreeChecked(checkedValue) {

    const matches = this.getMatchesForCheckStatus(checkedValue)

    this.tree.forEach(node => {
      if (node._parent) {
        node.hide = true
      }
    })

    let blankInput = false
    if (matches.length == this.tree.size) {
      blankInput = true
    }

    matches.forEach(m => {
      const node = this.getNodeById(m)
      node.hide = false
      if (!blankInput) {
        if (!isEmpty(node._children)) {
          node.expanded = true
        }
      }
      else {
        if (!node._parent) {
          node.expanded = true
        }
        else {
          node.expanded = false
        }
      }
    })


    const allNodesHidden = matches.length === 0
    return { allNodesHidden, tree: this.tree }
  }
  filterTree(searchTerm, treeSearchMode, labellabel) {

    const matches = this.getMatches(searchTerm.toLowerCase(), treeSearchMode, labellabel)

    this.tree.forEach(node => {
      if (node._parent) {
        node.hide = true
      }
    })

    let blankInput = false
    if (matches.length == this.tree.size) {
      blankInput = true
    }

    matches.forEach(m => {
      const node = this.getNodeById(m)
      node.hide = false
      if (!blankInput) {
        if (!isEmpty(node._children)) {
          node.expanded = true
        }
      }
      else {
        if (!node._parent) {
          node.expanded = true
        }
        else {
          node.expanded = false
        }
      }
    })


    const allNodesHidden = matches.length === 0
    return { allNodesHidden, tree: this.tree }
  }

  restoreNodes() {
    this.tree.forEach(node => {
      node.hide = false
    })

    return this.tree
  }

  /**
  * If the node didn't specify anything on its own
  * figure out the initial state based on parent selections
  * @param {object} node [description]
  */
  setInitialCheckState(node) {
    if (node.checked === undefined) node.checked = this.getNodeCheckedState(node)
  }

  /**
   * Figure out the check state based on parent selections.
   * @param  {[type]} node    [description]
   * @param  {[type]} tree    [description]
   * @return {[type]}         [description]
   */
  getNodeCheckedState(node) {
    let parentCheckState = false
    let parent = node._parent
    while (parent && !parentCheckState) {
      const parentNode = this.getNodeById(parent)
      parentCheckState = parentNode.checked || false
      parent = parentNode._parent
    }

    return parentCheckState
  }

  setNodeCheckedState(id, checked) {
    const node = this.getNodeById(id)
    node.checked = checked
    this.toggleChildren(id, checked)

    if (!checked) {
      this.unCheckParents(node)
    }

    if (node._parent) {
      this.checkParent(node._parent)
    }

  }


  //add by guf
  setNodeCheckedStates(ids, checked) {
    const nodeArr = this.getNodeByIds(ids)
    let parentArr = []
    nodeArr.forEach((node) => {
      if (node._parent) {
        parentArr.push(node._parent)
      }
      if (isEmpty(node._children)) {
        node.checked = checked
        this.toggleChildren(node._id, checked)

        if (!checked) {
          this.unCheckParents(node)
        }
      }
    })

    let parentArrDistinct = Array.from(new Set(parentArr))

    if (parentArrDistinct) {
      this.checkParents(parentArrDistinct)
    }

  }


  /**
   * Walks up the tree unchecking parent nodes
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  unCheckParents(node) {
    let parent = node._parent
    while (parent) {
      let next = this.getNodeById(parent)
      next.checked = false
      parent = next._parent
    }
  }


  checkParent(pId) {
    let node = this.getNodeById(pId)
    let cNodes = this.getNodeByIds(node._children)
    let needCheck = true
    for (var cIndex in cNodes) {
      if (!cNodes[cIndex].checked) {
        needCheck = false
        break
      }
    }
    node.checked = needCheck
    if (node._parent) {
      this.checkParent(node._parent)
    }
  }

  checkParents(ids) {
    if (ids) {
      for (var index in ids) {
        let node = this.getNodeById(ids[index])
        let cNodes = this.getNodeByIds(node._children)
        let needCheck = true
        for (var cIndex in cNodes) {
          if (!cNodes[cIndex].checked) {
            needCheck = false
            break
          }
        }
        node.checked = needCheck
      }
    }
  }

  toggleChildren(id, state) {
    const node = this.getNodeById(id)
    node.checked = state
    if (!isEmpty(node._children)) {
      node._children.forEach(id => this.toggleChildren(id, state))
    }
  }

  toggleNodeExpandState(id) {
    const node = this.getNodeById(id)
    node.expanded = !node.expanded
    if (!node.expanded) this.collapseChildren(node)
    return this.tree
  }

  collapseChildren(node) {
    node.expanded = false
    if (!isEmpty(node._children)) {
      node._children.forEach(c => this.collapseChildren(this.getNodeById(c)))
    }
  }

  getTags(nodeIds, inputClass) {
    const tags = []
    const visited = {}
    const markSubTreeVisited = (node) => {
      visited[node._id] = true
      if (!isEmpty(node._children)) node._children.forEach(c => markSubTreeVisited(this.getNodeById(c)))
    }

    this.tree.forEach((node, key) => {
      if (visited[key]) return

      if (inputClass) {
        node.tagClassName = inputClass
      }
      if (node.checked) {
        // Parent node, so no need to walk children
        tags.push(node)
        if (nodeIds instanceof Array) {
          nodeIds.push(node._id)
        }
        markSubTreeVisited(node)
      } else {
        visited[key] = true
      }
    })
    return tags
  }
}
