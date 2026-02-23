using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

namespace Uranus.SpineTools {
    public class SpinePrefabCreatorEditor : EditorWindow {
        private string spineExportPath = "Assets/SpineExports";
        private string prefabSavePath = "Assets/Prefabs/Spine";

        [MenuItem("Uranus/Spine Prefab Creator")]
        public static void ShowWindow() {
            GetWindow<SpinePrefabCreatorEditor>("Spine Creator");
        }

        private void OnGUI() {
            GUILayout.Label("Spine to Prefab (GOD-MODE)", EditorStyles.boldLabel);
            spineExportPath = EditorGUILayout.TextField("Spine JSON Path", spineExportPath);
            prefabSavePath = EditorGUILayout.TextField("Save Prefabs To", prefabSavePath);

            if (GUILayout.Button("Generate Prefabs")) {
                GeneratePrefabs();
            }
        }

        private void GeneratePrefabs() {
            if (!Directory.Exists(spineExportPath)) {
                Debug.LogError("Source directory not found!");
                return;
            }

            if (!Directory.Exists(prefabSavePath)) Directory.CreateDirectory(prefabSavePath);

            string[] files = Directory.GetFiles(spineExportPath, "*.json");
            foreach (string file in files) {
                string name = Path.GetFileNameWithoutExtension(file);
                GameObject go = new GameObject(name);
                
                // Add placeholder component (would be SkeletonAnimation in real project)
                // go.AddComponent<Spine.Unity.SkeletonAnimation>();
                
                // Add our event router
                // go.AddComponent<SpineEventRouter>();

                string localPath = Path.Combine(prefabSavePath, name + ".prefab");
                localPath = AssetDatabase.GenerateUniqueAssetPath(localPath);
                
                PrefabUtility.SaveAsPrefabAsset(go, localPath);
                DestroyImmediate(go);
                
                Debug.Log($"Generated prefab for {name}");
            }
            AssetDatabase.Refresh();
        }
    }
}
