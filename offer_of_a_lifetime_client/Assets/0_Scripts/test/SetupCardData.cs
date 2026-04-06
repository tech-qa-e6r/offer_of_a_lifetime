using UnityEngine;

// Enum for the 4 starting directions
public enum SetupCategory
{
    AgeAndBackground,
    BasicSkill,
    StartingResources,
    EmploymentStatus
}

[CreateAssetMenu(fileName = "NewSetupCard", menuName = "Game Data/Setup Card")]
public class SetupCardData : ScriptableObject
{
    // The category of this starting card
    public SetupCategory category;

    // Main title of the card
    public string cardName;

    // The lore/backstory written by you
    [TextArea(3, 5)]
    public string backgroundStory;

    [Header("--- Fill ONLY for 'Starting Resources' ---")]
    // Money the player starts with
    public int startingMoney;
    
    // Days the player has at the start
    public int startingDays;

    [Header("--- Fill ONLY for 'Basic Skill' ---")]
    // E.g., "C#", "Python", "Manual QA"
    public string skillName;
    
    [Header("--- Fill ONLY for 'Employment Status' ---")]
    // True if the player already has a job
    public bool isCurrentlyEmployed;
}